<script setup lang="ts">
import {
  BlockUI,
  Button,
  Checkbox,
  Dialog,
  FilePicker,
  FormField,
  FormFieldSet,
  InputDimensions,
  InputNumberSlider,
  Progress,
  Separator,
} from "@embroiderly/ui";

import { vElementSize } from "@vueuse/components";
import { useDebounceFn } from "@vueuse/core";
import { ref, reactive, onUnmounted, computed, shallowRef, useTemplateRef, watch } from "vue";

import { FilesApi } from "#pattern-editor/api";
import type { ImageImportOptions } from "#pattern-editor/api";
import { PatternCanvas } from "#pattern-editor/components/canvas";
import { LayersVisibility, Pattern } from "#pattern-editor/lib/pattern";
import { ImageImportService } from "#pattern-editor/services/";
import { useDragDrop, useFilePicker } from "#shared/composables/";
import { ANY_IMAGE_FILTER } from "#shared/constants/";

import { PaletteSelect } from "../palette/";

interface ImportImageModalProps {
  imagePath: string;
  imageDimensions: [width: number, height: number];
}

interface ValueBounds {
  min: number;
  max: number;
}

const props = defineProps<ImportImageModalProps>();
const emit = defineEmits<{ close: [patternId?: string] }>();

/** The maximum palette size acceptable for quantization. */
const MAX_PALETTE_SIZE = 256;

const filePicker = useFilePicker();

const patternCanvas = useTemplateRef("pattern-canvas");
const previewPattern = shallowRef<Pattern>();

const imageImportService = new ImageImportService();

const imagePath = ref(props.imagePath);
const imageDimensions = ref(props.imageDimensions);
watch(imagePath, async (newImagePath) => {
  imageDimensions.value = await FilesApi.getImageDimensions(newImagePath);
});

const dropZoneContainer = useTemplateRef("drop-zone");
const { isOverDropZone } = useDragDrop(dropZoneContainer, (paths) => {
  imagePath.value = paths[0]!;
});

const selectedPaletteSize = ref(1);
const selectedPalettePath = ref("");

const applyDithering = ref(true);
const imageImportOptions = reactive<Required<ImageImportOptions>>({
  patternSize: [Math.round(imageDimensions.value[0] * 0.1), Math.round(imageDimensions.value[1] * 0.1)],
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
  if (applyDithering.value && !checkValueInBounds(dithering.errorDiffusion, { min: 0, max: 1 })) return false;

  return true;
});

const imageImportServiceStarted = ref(false);

const importingPattern = ref(false);
const importPatternFromImage = useDebounceFn(
  async (options: ImageImportOptions) => {
    if (!imageImportServiceStarted.value) {
      await imageImportService.start();
      imageImportServiceStarted.value = true;
    }

    importingPattern.value = true;
    try {
      previewPattern.value = await imageImportService.getPreview(imagePath.value, selectedPalettePath.value, options);

      // Configure the pattern view.
      previewPattern.value.showSymbols = false;
      previewPattern.value.layersVisibility = new LayersVisibility({
        ...LayersVisibility.default(false),
        fullstitches: true,
      });
    } finally {
      importingPattern.value = false;
    }
  },
  100,
  { maxWait: 500 },
);

// Update the pattern preview on every change of options.
watch(
  [imagePath, selectedPalettePath, imageImportOptions, imageImportOptionsValid, applyDithering],
  async () => {
    if (!imageImportOptionsValid.value) return;

    const options = {
      ...imageImportOptions,
      dithering:
        applyDithering.value && imageImportOptions.dithering.errorDiffusion > 0
          ? imageImportOptions.dithering
          : undefined,
    };
    await importPatternFromImage(options);
  },
  { immediate: true, flush: "post" },
);

async function handleFinalize() {
  const options = {
    ...imageImportOptions,
    dithering:
      applyDithering.value && imageImportOptions.dithering.errorDiffusion > 0
        ? imageImportOptions.dithering
        : undefined,
  };

  const patternId = await imageImportService.finalize(imagePath.value, selectedPalettePath.value, options);
  emit("close", patternId);
}

onUnmounted(() => {
  imageImportService.destroy();
});
</script>

<template>
  <Dialog :title="$t('image-import')" :ui="{ content: 'size-full', body: 'p-0!' }">
    <template #body>
      <div class="flex h-full">
        <div class="space-y-2 overflow-y-auto p-4 sm:p-6">
          <FilePicker
            v-model="imagePath"
            class="w-full"
            @pick="
              async () => {
                const path = await filePicker.open({ filters: ANY_IMAGE_FILTER });
                if (path) imagePath = path;
              }
            "
          />

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
              @palette-selected="
                async (group, name) => (selectedPalettePath = await FilesApi.resolvePalettePath(group, name))
              "
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
                :format-options="{
                  style: 'percent',
                  maximumFractionDigits: 1,
                }"
              />
            </FormField>
          </FormFieldSet>

          <FormFieldSet :legend="$t('image-import-dither')" class="w-full space-y-2">
            <Checkbox v-model="applyDithering" :label="$t('image-import-dither-enable')" />

            <FormField :label="$t('image-import-dither-error')" class="w-full">
              <InputNumberSlider
                v-model="imageImportOptions.dithering.errorDiffusion"
                :min="0"
                :max="1"
                :step="0.001"
                :format-options="{
                  style: 'percent',
                  maximumFractionDigits: 1,
                }"
              />
            </FormField>
          </FormFieldSet>
        </div>

        <Separator decorative orientation="vertical" size="sm" />

        <BlockUI ref="drop-zone" :blocked="importingPattern || isOverDropZone" class="flex size-full flex-col">
          <Progress v-if="importingPattern" size="sm" class="absolute top-0 rounded-none" />

          <PatternCanvas
            ref="pattern-canvas"
            v-element-size="useDebounceFn(({ width, height }) => patternCanvas?.resizeCanvas(width, height), 100)"
            :pattern="previewPattern"
            :options="{ textureManager: { outlineStitches: false } }"
            class="min-h-0 flex-1"
            :class="{ hidden: !imageImportOptionsValid }"
          />

          <div v-if="previewPattern" class="border-t border-default px-2 py-1 text-sm">
            {{
              $t("image-import-pattern-properties", {
                paletteSize: previewPattern.palette.length,
                totalStitches: previewPattern.fullstitches.length,
              })
            }}
          </div>
        </BlockUI>
      </div>
    </template>
    <template #footer>
      <Button :label="$t('modal-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <Button
        loading-auto
        :label="$t('image-import-import-image')"
        :disabled="!imageImportOptionsValid"
        @click="handleFinalize"
      />
    </template>
  </Dialog>
</template>
