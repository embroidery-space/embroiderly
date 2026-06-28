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
  ScrollArea,
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
  <Dialog :title="$t('image-import')" :scroll="false" :ui="{ content: 'size-full', body: 'p-0!' }">
    <template #body>
      <div class="flex h-full" :class="{ 'flex-col': isMobilePortrait }">
        <ScrollArea
          type="auto"
          size="sm"
          :ui="{
            root: isMobilePortrait ? 'max-h-1/4 w-full shrink-0' : 'w-80 shrink-0',
            viewport: 'space-y-2 p-4 sm:p-6',
          }"
        >
          <InputFile v-model="imageFile" accept=".png, .jpg, .jpeg, .webp" class="w-full" />

          <InputDimensions
            v-model:width="imageImportOptions.patternSize[0]"
            v-model:height="imageImportOptions.patternSize[1]"
            :width-field-options="{ label: $t('fabric-width') }"
            :height-field-options="{ label: $t('fabric-height') }"
            :width-input-options="{ increment: false, decrement: false, ...patternSizeBounds.width }"
            :height-input-options="{ increment: false, decrement: false, ...patternSizeBounds.height }"
            :aspect-ratio="imageDimensions[0] / imageDimensions[1]"
          />

          <FormField :label="$t('image-import-palette')" class="w-full">
            <PaletteSelect
              variant="subtle"
              class="w-full"
              @palette-selected="async (group, name) => (selectedPaletteBytes = await files.loadPalette(group, name))"
              @palette-loaded="(palette) => (selectedPaletteSize = palette.length)"
            />
          </FormField>

          <FormField :label="$t('image-import-palette-size')" class="w-full">
            <InputNumberSlider v-model="imageImportOptions.paletteSize" v-bind="paletteSizeBounds" />
          </FormField>

          <FormFieldSet :legend="$t('image-import-quant')" class="w-full space-y-2">
            <FormField :label="$t('image-import-quant-sampling')" class="w-full">
              <InputNumberSlider
                v-model="imageImportOptions.quantization.samplingFactor"
                :min="0"
                :max="1"
                :step="0.001"
                :format-options="{ style: 'percent', maximumFractionDigits: 1 }"
              />
            </FormField>
          </FormFieldSet>

          <FormFieldSet :legend="$t('image-import-dither')" class="w-full space-y-2">
            <Checkbox v-model="applyDithering" :label="$t('image-import-dither-enable')" />

            <FormField :label="$t('image-import-dither-error')" class="w-full">
              <InputNumberSlider
                v-model="imageImportOptions.dithering!.errorDiffusion"
                :min="0"
                :max="1"
                :step="0.001"
                :format-options="{ style: 'percent', maximumFractionDigits: 1 }"
              />
            </FormField>
          </FormFieldSet>
        </ScrollArea>

        <Separator decorative :orientation="isMobilePortrait ? 'horizontal' : 'vertical'" size="sm" />

        <BlockUI ref="drop-zone" :blocked="importing || isOverDropZone" class="flex min-h-0 min-w-0 flex-1 flex-col">
          <Progress v-if="importing" size="sm" class="absolute top-0 rounded-none" />

          <PatternCanvas
            :pattern="preview?.pattern"
            :texture-manager-options="{ outlineStitches: false }"
            class="min-h-0 flex-1"
            :class="{ hidden: !imageImportOptionsValid }"
          />

          <div v-if="preview" class="border-t border-default px-2 py-1 text-sm">
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
