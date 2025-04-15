<template>
  <PaletteSection :title="$t('label-palette-colors')" @close="emit('close')">
    <PaletteList
      :model-value="props.palette.map((pi) => ({ brand: pi.brand, number: pi.number }))"
      :options="selectedPalette"
      :option-value="(pi) => ({ brand: pi.brand, number: pi.number })"
      :display-settings="PALETTE_CATALOG_DISPLAY_SETTINGS"
      multiple
      class="w-full border-0 rounded-none"
      :style="{ backgroundColor: dt('content.background') }"
      @option-dblclick="({ palitem }) => handlePaletteCatalogOptionDoubleClick(palitem)"
    >
      <template #header>
        <Select
          v-model="selectedPaletteCatalogItem"
          :options="[...paletteCatalog.keys()]"
          :loading="loadingPalette"
          size="small"
          class="w-full"
        />
      </template>

      <template #option="{ option, displaySettings }">
        <PaletteItemComponent
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
  import { dt } from "@primeuix/themes";
  import { Select } from "primevue";
  import { PaletteItem, PaletteSettings } from "#/schemas/index.ts";
  import PaletteList from "./PaletteList.vue";
  import PaletteItemComponent from "./PaletteItem.vue";
  import PaletteSection from "./PaletteSection.vue";

  const props = defineProps<{ palette: PaletteItem[] }>();
  const emit = defineEmits<{
    (event: "close"): void;
    (event: "addPaletteItem", palitem: PaletteItem): void;
    (event: "removePaletteItem", palindex: number): void;
  }>();

  const PALETTE_CATALOG_DISPLAY_SETTINGS = new PaletteSettings({
    columnsNumber: 4,
    colorOnly: false,
    showColorBrands: false,
    showColorNumbers: true,
    showColorNames: false,
  });

  const paletteCatalog = ref<Map<string, PaletteItem[] | undefined>>(new Map());
  const selectedPaletteCatalogItem = ref("DMC");

  const paletteCatalogDirPath = ref<string>();

  const loadingPalette = ref(false);
  const selectedPalette = computedAsync<PaletteItem[]>(
    async () => {
      loadingPalette.value = true;
      const brand = selectedPaletteCatalogItem.value;
      let palette = paletteCatalog.value.get(brand);
      if (palette === undefined) {
        const path = [paletteCatalogDirPath.value, `${brand}.json`].join(sep());
        const content = await readTextFile(path);
        // @ts-expect-error Here, palitems have `brand`, `number`, `name`, and `color` properties which is enough to create an instance of the `PaletteItem`.
        // The rest of the properties are optional.
        palette = JSON.parse(content).map((pi) => new PaletteItem(pi));
        paletteCatalog.value.set(brand, palette);
      }
      loadingPalette.value = false;
      return palette as PaletteItem[];
    },
    [],
    { lazy: true },
  );

  function handlePaletteCatalogOptionDoubleClick(palitem: PaletteItem) {
    const isAlreadyContained = props.palette.find((pi) => comparePaletteItems(pi, palitem));
    if (isAlreadyContained) {
      const palindex = props.palette.indexOf(isAlreadyContained);
      emit("removePaletteItem", palindex);
    } else emit("addPaletteItem", palitem);
  }

  function comparePaletteItems(pi1: PaletteItem, pi2: PaletteItem) {
    return pi1.brand === pi2.brand && pi1.number === pi2.number;
  }

  onMounted(async () => {
    paletteCatalogDirPath.value = await resolveResource("resources/palettes");
    for (const entry of await readDir(paletteCatalogDirPath.value)) {
      if (entry.isFile) {
        // The file name is the brand name.
        const brand = entry.name.split(".")[0]!;
        paletteCatalog.value.set(brand, undefined);
      }
    }
  });
</script>
