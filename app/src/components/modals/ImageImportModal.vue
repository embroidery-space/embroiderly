<template>
  <UModal title="Image Import" :ui="{ content: 'size-[90%]', body: 'py-0!' }">
    <template #body>
      <div class="flex h-full gap-x-4">
        <div class="space-y-2 py-4 sm:py-6">
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
                :max="imageDimensions[0]"
              />
            </UFormField>

            <UFormField :label="$t('label-height')" class="w-full">
              <UInputNumber
                v-model="imageImportOptions.patternSize[1]"
                :increment="false"
                :decrement="false"
                :max="imageDimensions[1]"
              />
            </UFormField>
          </div>

          <div class="flex items-end gap-x-2">
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

            <UFormField label="Palette Size" class="w-full">
              <UInputNumber v-model="imageImportOptions.paletteSize" :increment="false" :decrement="false" />
            </UFormField>
          </div>
        </div>

        <USeparator decorative orientation="vertical" />

        <div class="flex w-full items-center justify-center py-4 sm:py-6">
          <!-- <UEmpty
            v-if="imageImportOptionsInvalid"
            title="No image"
            description="The image import options are invalid."
          /> -->
          <canvas
            ref="canvas"
            v-element-size="useDebounceFn(({ width, height }) => patternApplication.resize(width, height), 100)"
            class="size-full"
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
  import { computedAsync, useDebounceFn, watchDebounced } from "@vueuse/core";
  import { useTemplateRef } from "vue";
  import { ref, reactive, onMounted, onUnmounted, shallowRef, computed } from "vue";

  import { FilesApi } from "~/api";
  import { LayersVisibility } from "~/core/pattern";
  import { PatternApplication, PatternView } from "~/core/pixi";

  type Size = [width: number, height: number];

  interface ImageImportOptions {
    patternSize: [number, number];
    paletteSize: number;
  }

  interface ImportImageModalProps {
    imagePath: string;
    imageDimensions: Size;
  }

  const filePicker = useFilePicker();
  const fluent = useFluent();

  const props = defineProps<ImportImageModalProps>();
  const emit = defineEmits<{ close: [] }>();

  const canvas = useTemplateRef("canvas");

  const imagePath = ref(props.imagePath);
  async function chooseImage() {
    const path = await filePicker.open({ filters: filePicker.ANY_IMAGE_FILTER });
    if (path !== null) imagePath.value = path;
  }

  const imageImportOptions = reactive<ImageImportOptions>({
    patternSize: [0, 0],
    paletteSize: 0,
  });
  const imageImportOptionsInvalid = computed(() => {
    const { patternSize, paletteSize } = imageImportOptions;
    return !patternSize[0] || !patternSize[1] || !paletteSize;
  });

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

  const patternApplication = new PatternApplication();
  const patternApplicationInitialized = ref(false);

  const importingPattern = ref(false);
  async function importPatternFromImage() {
    if (!patternApplicationInitialized.value) {
      await patternApplication.init(canvas.value!);
      patternApplicationInitialized.value = true;
    }

    importingPattern.value = true;
    try {
      const pattern = await FilesApi.importPatternFromImage(
        imagePath.value,
        selectedPalettePath.value,
        imageImportOptions,
      );
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
  }

  watchDebounced(
    [imagePath, selectedPalettePath, imageImportOptions],
    async () => {
      if (imageImportOptionsInvalid.value) return;
      await importPatternFromImage();
    },
    { debounce: 1000 },
  );

  onMounted(async () => {
    await loadPalettesList();
  });

  onUnmounted(() => {
    patternApplication.destroy();
  });
</script>
