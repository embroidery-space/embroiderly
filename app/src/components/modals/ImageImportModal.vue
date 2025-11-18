<template>
  <UModal :title="$t('image-import')" :ui="{ content: 'size-[90%]', body: 'p-0!' }">
    <template #body>
      <div class="flex h-full">
        <div class="space-y-2 p-4 sm:p-6">
          <FilePicker v-model="imagePath" :options="{ filters: ANY_IMAGE_FILTER }" class="w-full" />

          <DimensionsInput
            v-model:width="imageImportOptions.patternSize[0]"
            v-model:height="imageImportOptions.patternSize[1]"
            :width-field-props="{ label: $t('fabric-width') }"
            :height-field-props="{ label: $t('fabric-height') }"
            :width-input-props="{ increment: false, decrement: false, ...patternSizeBounds.width }"
            :height-input-props="{ increment: false, decrement: false, ...patternSizeBounds.height }"
            :aspect-ratio="imageDimensions[0] / imageDimensions[1]"
          />

          <UFormField :label="$t('image-import-palette')" class="w-full">
            <PaletteSelect
              size="xl"
              variant="subtle"
              class="w-full"
              @palette-selected="
                async (group, name) => (selectedPalettePath = await FilesApi.resolvePalettePath(group, name))
              "
              @palette-loaded="(palette) => (selectedPaletteSize = palette.length)"
            />
          </UFormField>

          <UFormField :label="$t('image-import-palette-size')" class="w-full">
            <InputNumberSlider v-model="imageImportOptions.paletteSize" v-bind="paletteSizeBounds" />
          </UFormField>

          <FormFieldset :legend="$t('image-import-quant')" class="w-full space-y-2">
            <UFormField :label="$t('image-import-quant-sampling')" class="w-full">
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
            </UFormField>
          </FormFieldset>

          <FormFieldset :legend="$t('image-import-dither')" class="w-full space-y-2">
            <UCheckbox v-model="applyDithering" :label="$t('image-import-dither-enable')" />

            <UFormField :label="$t('image-import-dither-error')" class="w-full">
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
            </UFormField>
          </FormFieldset>
        </div>

        <USeparator decorative orientation="vertical" size="sm" />

        <BlockUI :blocked="importingPattern" class="size-full">
          <UProgress v-if="importingPattern" size="sm" :ui="{ root: 'absolute top-0', base: 'rounded-none' }" />
          <canvas
            ref="canvas"
            v-element-size="useDebounceFn(({ width, height }) => patternApplication.resize(width, height), 100)"
            class="size-full"
            :class="{ hidden: !imageImportOptionsValid }"
          ></canvas>
        </BlockUI>
      </div>
    </template>
    <template #footer>
      <UButton :label="$t('modal-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <UButton :label="$t('image-import-import-image')" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { vElementSize } from "@vueuse/components";
  import { useDebounceFn } from "@vueuse/core";
  import { ref, reactive, onUnmounted, computed, watchPostEffect, useTemplateRef, watch } from "vue";

  import { FilesApi } from "~/api";
  import type { ImageImportOptions } from "~/api";
  import { ANY_IMAGE_FILTER } from "~/composables/file-picker.ts";
  import { LayersVisibility } from "~/core/pattern";
  import { PatternApplication, PatternView } from "~/core/pixi";

  /** The maximum palette size acceptable for quantization. */
  const MAX_PALETTE_SIZE = 256;

  interface ImportImageModalProps {
    imagePath: string;
    imageDimensions: [width: number, height: number];
  }

  interface ValueBounds {
    min: number;
    max: number;
  }

  const props = defineProps<ImportImageModalProps>();
  const emit = defineEmits<{ close: [] }>();

  const canvas = useTemplateRef("canvas");

  const patternApplication = new PatternApplication();
  const patternApplicationInitialized = ref(false);

  const imagePath = ref(props.imagePath);
  const imageDimensions = ref(props.imageDimensions);
  watch(imagePath, async (newImagePath) => {
    imageDimensions.value = await FilesApi.getImageDimensions(newImagePath);
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

  const importingPattern = ref(false);
  const importPatternFromImage = useDebounceFn(
    async (options: ImageImportOptions) => {
      if (!patternApplicationInitialized.value) {
        await patternApplication.init(canvas.value!);
        patternApplicationInitialized.value = true;
      }

      importingPattern.value = true;
      try {
        const pattern = await FilesApi.importPatternFromImage(imagePath.value, selectedPalettePath.value, options);
        patternApplication.view = new PatternView(pattern);

        // Configure the pattern view.
        patternApplication.view.setShowSymbols(false);
        patternApplication.view.setLayersVisibility({
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
  watchPostEffect(async () => {
    if (!imageImportOptionsValid.value) return;

    const options = {
      ...imageImportOptions,
      dithering:
        applyDithering.value && imageImportOptions.dithering.errorDiffusion > 0
          ? imageImportOptions.dithering
          : undefined,
    };
    await importPatternFromImage(options);
  });

  onUnmounted(() => {
    patternApplication.destroy();
  });
</script>
