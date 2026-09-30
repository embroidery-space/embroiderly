<script setup lang="ts">
import { ImageImportService } from "@embroiderly/image-import";
import type { ImageImportOptions } from "@embroiderly/image-import";
import {
  BlockUI,
  Button,
  Checkbox,
  Dialog,
  FormField,
  InputFile,
  FormFieldSet,
  InputDimensions,
  InputNumberSlider,
  Progress,
  Separator,
  useToast,
} from "@embroiderly/ui";

import { useDebounceFn, useDropZone, useMediaQuery } from "@vueuse/core";
import { ref, reactive, onUnmounted, computed, shallowRef, useTemplateRef, watch } from "vue";

import { PatternCanvas } from "~/components/canvas/";
import { useEditor, useI18n } from "~/composables/";
import { DisplayMode, DisplaySettings, Pattern } from "~/lib/pattern/";
import { LoggerService } from "~/services/";

import { PaletteSelect } from "../palette/";

interface ValueBounds {
  min: number;
  max: number;
}

const emit = defineEmits<{ close: [patternBytes?: Uint8Array] }>();

/** The maximum palette size acceptable for quantization. */
const MAX_PALETTE_SIZE = 256;

const { files } = useEditor();
const { fluent } = useI18n();
const toast = useToast();

const service = new ImageImportService();

const isMobilePortrait = useMediaQuery("(max-width: 767px) and (orientation: portrait)");

const imageFile = ref<File>();
const imageDimensions = ref<[number, number]>([0, 0]);

watch(imageFile, async (file) => {
  if (!file) return;
  await loadImageFile(file);
});

const { isOverDropZone } = useDropZone(useTemplateRef("drop-zone"), {
  onDrop(files) {
    const file = files?.[0];
    if (file) loadImageFile(file);
  },
});

async function loadImageFile(file: File) {
  try {
    const { width, height } = await service.start(new Uint8Array(await file.arrayBuffer()));

    imageFile.value = file;
    imageDimensions.value = [width, height];

    imageImportOptions.patternSize = [Math.round(width * 0.1), Math.round(height * 0.1)];
  } catch (err) {
    LoggerService.error(`Failed to load image file: ${err}`);
    toast.add({ color: "error", title: fluent.$t("error"), duration: 3000 });
  }
}

const selectedPaletteBytes = ref<Uint8Array | null>(null);
const selectedPaletteSize = ref(1);

const applyDithering = ref(true);
const imageImportOptions = reactive<Required<ImageImportOptions>>({
  patternSize: [0, 0],
  paletteSize: 32,
  quantization: {
    samplingFactor: 1,
  },
  dithering: {
    errorDiffusion: 0.875,
  },
});

const patternSizeBounds = computed<{ width: ValueBounds; height: ValueBounds }>(() => {
  const width = { min: 1, max: imageDimensions.value[1] };
  const height = { min: 1, max: imageDimensions.value[0] };
  return { width, height };
});
const paletteSizeBounds = computed<ValueBounds>(() => {
  return { min: 1, max: Math.min(selectedPaletteSize.value, MAX_PALETTE_SIZE) };
});

const imageImportOptionsValid = computed(() => {
  function checkValueInBounds(value: number, bounds: ValueBounds): boolean {
    return value >= bounds.min && value <= bounds.max;
  }

  const { patternSize, paletteSize, quantization, dithering } = imageImportOptions;

  // Validate pattern dimensions.
  if (!checkValueInBounds(patternSize[0], patternSizeBounds.value.width)) return false;
  if (!checkValueInBounds(patternSize[1], patternSizeBounds.value.height)) return false;

  // Validate palette size.
  if (!checkValueInBounds(paletteSize, paletteSizeBounds.value)) return false;

  // Validate quantization options.
  if (!checkValueInBounds(quantization.samplingFactor, { min: 0, max: 1 })) return false;

  // Validate dithering options.
  if (applyDithering.value && !checkValueInBounds(dithering!.errorDiffusion, { min: 0, max: 1 })) return false;

  return true;
});

const preview = shallowRef<{ bytes: Uint8Array; pattern: Pattern } | null>(null);
const importing = ref(false);

let currentRequest: Promise<Uint8Array> | null = null;
const updatePreview = useDebounceFn(
  async () => {
    if (!imageImportOptionsValid.value) return;

    const options: ImageImportOptions = {
      ...imageImportOptions,
      dithering:
        applyDithering.value && imageImportOptions.dithering!.errorDiffusion > 0 ? imageImportOptions.dithering : null,
    };

    importing.value = true;

    const request = service.getPreview(selectedPaletteBytes.value!, options);
    currentRequest = request;

    try {
      const bytes = await request;
      if (request !== currentRequest) return;

      preview.value = { bytes, pattern: Pattern.deserialize(bytes) };
      preview.value.pattern.displaySettings = new DisplaySettings({
        grid: preview.value.pattern.displaySettings.grid,
        displayMode: DisplayMode.Solid,
        showSymbols: false,
        showGrid: false,
        showRulers: false,
      });
    } finally {
      if (request === currentRequest) importing.value = false;
    }
  },
  100,
  { maxWait: 500 },
);

watch([imageFile, selectedPaletteBytes, imageImportOptions, applyDithering], () => updatePreview(), { flush: "post" });

onUnmounted(() => service.destroy());
</script>

<template>
  <Dialog :title="$t('image-import')" :class="$style.dialog">
    <template #body>
      <div :class="[$style.layout, { [$style.portrait]: isMobilePortrait }]">
        <div :class="$style.options">
          <InputFile v-model="imageFile" accept=".png, .jpg, .jpeg, .webp" :class="$style.file" />

          <InputDimensions
            v-model:width="imageImportOptions.patternSize[0]"
            v-model:height="imageImportOptions.patternSize[1]"
            :width-field-options="{ label: $t('fabric-width') }"
            :height-field-options="{ label: $t('fabric-height') }"
            :width-input-options="{ increment: false, decrement: false, ...patternSizeBounds.width }"
            :height-input-options="{ increment: false, decrement: false, ...patternSizeBounds.height }"
            :aspect-ratio="imageDimensions[0] / imageDimensions[1]"
          />

          <FormField :label="$t('image-import-palette')">
            <PaletteSelect
              variant="subtle"
              @palette-selected="async (group, name) => (selectedPaletteBytes = await files.loadPalette(group, name))"
              @palette-loaded="(palette) => (selectedPaletteSize = palette.length)"
            />
          </FormField>

          <FormField :label="$t('image-import-palette-size')">
            <InputNumberSlider v-model="imageImportOptions.paletteSize" v-bind="paletteSizeBounds" />
          </FormField>

          <FormFieldSet :legend="$t('image-import-quant')" :class="$style.fieldset">
            <FormField :label="$t('image-import-quant-sampling')">
              <InputNumberSlider
                v-model="imageImportOptions.quantization.samplingFactor"
                :min="0"
                :max="1"
                :step="0.001"
                :format-options="{ style: 'percent', maximumFractionDigits: 1 }"
              />
            </FormField>
          </FormFieldSet>

          <FormFieldSet :legend="$t('image-import-dither')" :class="$style.fieldset">
            <Checkbox v-model="applyDithering" :label="$t('image-import-dither-enable')" />

            <FormField :label="$t('image-import-dither-error')">
              <InputNumberSlider
                v-model="imageImportOptions.dithering!.errorDiffusion"
                :min="0"
                :max="1"
                :step="0.001"
                :format-options="{ style: 'percent', maximumFractionDigits: 1 }"
              />
            </FormField>
          </FormFieldSet>
        </div>

        <Separator decorative :orientation="isMobilePortrait ? 'horizontal' : 'vertical'" size="sm" />

        <BlockUI ref="drop-zone" :blocked="importing || isOverDropZone" :class="$style.preview">
          <Progress v-if="importing" size="sm" :class="$style.progress" />

          <PatternCanvas
            :pattern="preview?.pattern"
            :texture-manager-options="{ outlineStitches: false }"
            :class="[$style.canvas, { [$style.hidden]: !imageImportOptionsValid }]"
          />

          <div v-if="preview" :class="$style.properties">
            {{
              $t("image-import-pattern-properties", {
                paletteSize: preview.pattern.palette.length,
                totalStitches: preview.pattern.layers.items.reduce((acc, layer) => acc + layer.fullstitches.length, 0),
              })
            }}
          </div>
        </BlockUI>
      </div>
    </template>

    <template #footer>
      <Button :label="$t('modal-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <Button
        :label="$t('image-import-import-image')"
        :disabled="!imageImportOptionsValid || !preview"
        @click="emit('close', preview?.bytes)"
      />
    </template>
  </Dialog>
</template>

<style module>
.dialog[data-slot="content"] {
  width: 100%;
  height: 100%;

  > [data-slot="body"] {
    padding: 0;
  }
}

.layout {
  display: flex;
  height: 100%;

  &.portrait {
    flex-direction: column;
  }
}

.options {
  overflow-y: auto;
  flex-shrink: 0;
  width: calc(var(--spacing) * 80);
  padding: calc(var(--spacing) * 4);

  > :not(:last-child) {
    margin-block-end: calc(var(--spacing) * 2);
  }

  .portrait > & {
    width: 100%;
    max-height: 25%;
  }

  @media (width >= 40rem) {
    padding: calc(var(--spacing) * 6);
  }
}

.file[data-slot="base"] {
  width: 100%;
}

.fieldset {
  width: 100%;

  > :not(:last-child) {
    margin-block-end: calc(var(--spacing) * 2);
  }
}

.preview {
  display: flex;
  flex: 1;
  flex-direction: column;

  min-width: 0;
  min-height: 0;
}

.progress[data-slot="base"] {
  position: absolute;
  top: 0;
  border-radius: 0;
}

.canvas {
  flex: 1;
  min-height: 0;

  &.hidden {
    display: none;
  }
}

.properties {
  padding-block: calc(var(--spacing) * 1);
  padding-inline: calc(var(--spacing) * 2);
  border-top: 1px solid var(--border-color-default);

  font-size: var(--text-sm);
  line-height: var(--text-sm--line-height);
}
</style>
