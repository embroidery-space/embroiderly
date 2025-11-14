<template>
  <UModal title="Image Import" :ui="{ content: 'size-[90%]', body: 'p-0!' }">
    <template #body>
      <div class="flex h-full">
        <div class="space-y-2 p-4 sm:p-6">
          <UFieldGroup class="w-full">
            <UButton :label="$t('label-choose-file')" @click="chooseImage" />
            <UInput :model-value="imagePath" readonly class="w-full" />
          </UFieldGroup>

          <div class="flex gap-x-2">
            <UFormField :label="$t('label-width')" class="w-full">
              <UInputNumber
                v-model="imageImportOptions.patternSize[0]"
                :increment="false"
                :decrement="false"
                v-bind="patternSizeBounds.width"
              />
            </UFormField>

            <UFormField :label="$t('label-height')" class="w-full">
              <UInputNumber
                v-model="imageImportOptions.patternSize[1]"
                :increment="false"
                :decrement="false"
                v-bind="patternSizeBounds.height"
              />
            </UFormField>
          </div>

          <UFormField label="Palette" class="w-full">
            <USelectMenu
              v-model="selectedPaletteKey"
              :items="paletteOptions"
              value-key="value"
              size="xl"
              variant="subtle"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Palette Size">
            <div class="flex items-center gap-x-2">
              <UInputNumber
                v-model="imageImportOptions.paletteSize"
                :increment="false"
                :decrement="false"
                v-bind="paletteSizeBounds"
              />
              <USlider v-model="imageImportOptions.paletteSize" tooltip v-bind="paletteSizeBounds" class="w-full" />
            </div>
          </UFormField>

          <FormFieldset legend="Colors Reduction" class="w-full space-y-2">
            <UFormField label="Sampling Precision" class="w-full">
              <div class="flex items-center gap-x-2">
                <UInputNumber
                  v-model="imageImportOptions.quantization.samplingFactor"
                  :increment="false"
                  :decrement="false"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  :format-options="{ maximumFractionDigits: 3 }"
                />
                <USlider
                  v-model="imageImportOptions.quantization.samplingFactor"
                  tooltip
                  :min="0"
                  :max="1"
                  :step="0.1"
                  class="w-full"
                />
              </div>
            </UFormField>
          </FormFieldset>

          <FormFieldset legend="Dithering" class="w-full space-y-2">
            <UCheckbox v-model="applyDithering" label="Apply dithering" />

            <UFormField label="Dithering Strength" class="w-full">
              <div class="flex items-center gap-x-2">
                <UInputNumber
                  v-model="imageImportOptions.dithering.errorDiffusion"
                  :disabled="!applyDithering"
                  :increment="false"
                  :decrement="false"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  :format-options="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
                />
                <USlider
                  v-model="imageImportOptions.dithering.errorDiffusion"
                  tooltip
                  :disabled="!applyDithering"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  class="w-full"
                />
              </div>
            </UFormField>
          </FormFieldset>
        </div>

        <USeparator decorative orientation="vertical" size="sm" />

        <div class="flex w-full items-center justify-center">
          <UEmpty
            v-if="!imageImportOptionsValid"
            title="No image"
            description="The image import options are invalid."
          />
          <canvas
            ref="canvas"
            v-element-size="useDebounceFn(({ width, height }) => patternApplication.resize(width, height), 100)"
            class="size-full"
            :class="{ hidden: !imageImportOptionsValid }"
          ></canvas>
        </div>
      </div>
    </template>
    <template #footer>
      <UButton :label="$t('label-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <UButton :label="$t('label-import-image')" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import type { SelectMenuItem } from "@nuxt/ui";
  import { vElementSize } from "@vueuse/components";
  import { computedAsync, useDebounceFn } from "@vueuse/core";
  import { useTemplateRef } from "vue";
  import { ref, reactive, onMounted, onUnmounted, shallowRef, computed, watchPostEffect } from "vue";

  import { FilesApi } from "~/api";
  import type { ImageImportOptions } from "~/api";
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

  const filePicker = useFilePicker();
  const fluent = useFluent();

  const props = defineProps<ImportImageModalProps>();
  const emit = defineEmits<{ close: [] }>();

  const canvas = useTemplateRef("canvas");

  const patternApplication = new PatternApplication();
  const patternApplicationInitialized = ref(false);

  const imagePath = ref(props.imagePath);
  const imageDimensions = ref(props.imageDimensions);
  async function chooseImage() {
    const path = await filePicker.open({ filters: filePicker.ANY_IMAGE_FILTER });
    if (path !== null) {
      imagePath.value = path;
      imageDimensions.value = await FilesApi.getImageDimensions(path);
    }
  }

  const selectedPaletteKey = ref("system/DMC");
  const selectedPalettePath = computedAsync(async () => {
    const [brand, name] = selectedPaletteKey.value.split("/") as [string, string];
    return await FilesApi.resolvePalettePath(brand, name);
  }, "");
  const paletteOptions = shallowRef<SelectMenuItem[][]>([]);

  async function loadPalettesList() {
    const { system, custom } = await FilesApi.getPalettesList();

    const systemPalettes: SelectMenuItem[] = [{ label: fluent.$t("label-files-system"), type: "label" }];
    for (const palette of system) systemPalettes.push({ label: palette, value: `system/${palette}` });

    const customPalettes: SelectMenuItem[] = [{ label: fluent.$t("label-files-custom"), type: "label" }];
    for (const palette of custom) customPalettes.push({ label: palette, value: `custom/${palette}` });

    paletteOptions.value = [systemPalettes, customPalettes];
  }

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
  const paletteSizeBounds = computedAsync<ValueBounds>(
    async () => {
      const [brand, name] = selectedPaletteKey.value.split("/") as [string, string];
      const selectedPaletteSize = await FilesApi.getPaletteSize(brand, name);
      return { min: 1, max: Math.min(selectedPaletteSize, MAX_PALETTE_SIZE) };
    },
    { min: 1, max: MAX_PALETTE_SIZE },
  );

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

  onMounted(async () => {
    await loadPalettesList();
  });

  onUnmounted(() => {
    patternApplication.destroy();
  });
</script>
