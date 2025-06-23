<template>
  <PaletteSection :title="$t('label-palette-colors')">
    <PaletteList
      :model-value="props.palette.map((pi) => ({ brand: pi.brand, number: pi.number }))"
      :options="selectedPalette"
      :option-value="(pi) => ({ brand: pi.brand, number: pi.number })"
      :display-settings="PALETTE_CATALOG_DISPLAY_SETTINGS"
      multiple
      meta-key-selection
      class="overflow-y-auto"
      @option-dblclick="({ palitem }) => handlePaletteCatalogOptionDoubleClick(palitem)"
    >
      <template #header>
        <NuxtSelect
          v-model="selectedPaletteCatalogItem"
          :items="paletteCatalogOptions"
          :loading="loadingPalette"
          size="md"
          class="w-full"
        />
      </template>

      <template #option="{ option, displaySettings }">
        <PaletteListItem
          :palette-item="option"
          :selected="props.palette.find((pi) => comparePaletteItems(pi, option)) !== undefined"
          :display-settings="displaySettings"
        />
      </template>
    </PaletteList>
  </PaletteSection>
</template>

<script setup lang="ts">
  import { resolveResource, sep } from "@tauri-apps/api/path";
  import { readDir, readTextFile } from "@tauri-apps/plugin-fs";
  import { onMounted, ref } from "vue";
  import { computedAsync } from "@vueuse/core";
  import { dequal } from "dequal";
  import { PaletteItem, PaletteSettings } from "#/schemas/";

  const props = defineProps<{ palette: PaletteItem[] }>();
  const emit = defineEmits<{
    addPaletteItem: [palitem: PaletteItem];
    removePaletteItem: [palindex: number];
  }>();

  const PALETTE_CATALOG_DISPLAY_SETTINGS = new PaletteSettings({
    columnsNumber: 4,
    colorOnly: false,
    showColorBrands: false,
    showColorNumbers: true,
    showColorNames: false,
  });

  const paletteCatalog = new Map<string, PaletteItem[] | undefined>();
  const paletteCatalogOptions = ref<string[]>([]);
  const selectedPaletteCatalogItem = ref("DMC");

  const paletteCatalogDirPath = ref<string>();

  const loadingPalette = ref(false);
  const selectedPalette = computedAsync<PaletteItem[]>(
    async () => {
      loadingPalette.value = true;
      const brand = selectedPaletteCatalogItem.value;
      let palette = paletteCatalog.get(brand);
      if (palette === undefined) {
        const path = [paletteCatalogDirPath.value, `${brand}.json`].join(sep());
        const content = await readTextFile(path);
        // @ts-expect-error Here, palitems have `brand`, `number`, `name`, and `color` properties which is enough to create an instance of the `PaletteItem`.
        // The rest of the properties are optional.
        palette = JSON.parse(content).map((pi) => new PaletteItem(pi));
        paletteCatalog.set(brand, palette);
      }
      loadingPalette.value = false;
      return palette as PaletteItem[];
    },
    [],
    { lazy: true },
  );

  function handlePaletteCatalogOptionDoubleClick(palitem: PaletteItem) {
    const isAlreadyContained = props.palette.find((pi) => dequal(pi, palitem));
    if (isAlreadyContained) {
      const palindex = props.palette.indexOf(isAlreadyContained);
      emit("removePaletteItem", palindex);
    } else emit("addPaletteItem", palitem);
  }

  /**
   * We maintain a separate function to compare palette items because the `pi1` has more properties than the `pi2`.
   * This function only compares the `brand` and `number` properties.
   *
   * @param pi1 - The palette item from the `props.palette`
   * @param pi2 - The palette item from the catalog.
   */
  function comparePaletteItems(pi1: PaletteItem, pi2: PaletteItem) {
    return pi1.brand === pi2.brand && pi1.number === pi2.number;
  }

  onMounted(async () => {
    paletteCatalogDirPath.value = await resolveResource("resources/palettes");
    for (const entry of await readDir(paletteCatalogDirPath.value)) {
      if (entry.isFile) {
        // The file name is the brand name.
        const brand = entry.name.split(".")[0]!;
        paletteCatalog.set(brand, undefined);
      }
    }
    paletteCatalogOptions.value = [...paletteCatalog.keys()];
  });
</script>
