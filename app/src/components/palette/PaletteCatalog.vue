<script setup lang="ts">
import { Button, DropdownMenu, Input, useConfirm, useToast } from "@embroiderly/ui";
import type { DropdownMenuItem } from "@embroiderly/ui";

import { useFuse } from "@vueuse/integrations/useFuse";
import { useTemplateRef, ref, computed, shallowRef } from "vue";
import type { Ref } from "vue";

import { FilesApi } from "~/api/";
import { IconMenu, IconSearch } from "~/assets/icons/";
import { useFilePicker, useI18n } from "~/composables/";
import { PALETTE_FILTER } from "~/constants/";
import { BrandPaletteItem, PaletteItem, PaletteSettings } from "~/lib/pattern/";
import { LoggerService } from "~/services/";

import { PaletteSection, PaletteList, PaletteListItem, PaletteSelect } from ".";

const { palette } = defineProps<{ palette: readonly PaletteItem[] }>();
const emit = defineEmits<{
  addPaletteItem: [palitem: PaletteItem];
  removePaletteItem: [palindex: number];
}>();

const PALETTE_CATALOG_DISPLAY_SETTINGS = new PaletteSettings({
  columnsNumber: 4,
  colorOnly: false,
  showStitchSymbols: false,
  stitchSymbolsOnContrastBackground: false,
  showColorBrands: false,
  showColorNumbers: true,
  showColorNames: false,
});

const confirm = useConfirm();
const filePicker = useFilePicker();
const { fluent } = useI18n();
const toast = useToast();

const paletteSelect = useTemplateRef("palette-select");

const searchQuery = ref("");
const selectedPalette: Ref<BrandPaletteItem[]> = shallowRef([]);
const { results } = useFuse(searchQuery, selectedPalette, {
  matchAllWhenSearchEmpty: true,
  fuseOptions: {
    keys: ["number", "name"],
    threshold: 0, // Exact match.
    ignoreLocation: true, // Anywhere in the string.
    ignoreFieldNorm: true, // Range both short and long values similarly.
    ignoreDiacritics: true,
  },
});

const paletteCatalogMenuOptions = computed<DropdownMenuItem[]>(() => [
  {
    label: fluent.$t("palette-catalog-menu-import-palettes"),
    onSelect: importPalettes,
    loading: importingPalettes.value,
  },
]);

const importingPalettes = ref(false);
async function importPalettes() {
  const paths = (await filePicker.open({ multiple: true, filters: PALETTE_FILTER })) as string[] | null;
  if (!paths) return;

  try {
    importingPalettes.value = true;

    const { failedFiles } = await FilesApi.importPalettes(paths);
    await paletteSelect.value!.loadPalettesList();

    if (failedFiles.length) {
      confirm.open(
        fluent.$ta("palette-catalog-import-failed-files", {
          failedFilesList: failedFiles.map((file) => `- ${file}`).join("\n"),
        }),
      );
    } else toast.add({ title: fluent.$t("palette-catalog-import-success"), color: "success" });
  } catch (err) {
    LoggerService.error(`Failed to import palettes: ${err}`);
    toast.add({ title: fluent.$t("palette-catalog-import-failure"), color: "error" });
  } finally {
    importingPalettes.value = false;
  }
}

function handlePaletteCatalogOptionDoubleClick(option: BrandPaletteItem) {
  const palindex = palette.findIndex((palitem) => palitem.eq(option));
  if (palindex === -1) emit("addPaletteItem", option);
  else emit("removePaletteItem", palindex);
}
</script>

<template>
  <PaletteSection :title="$t('palette-catalog')">
    <PaletteList
      :model-value="palette.map((pi) => ({ brand: pi.brand, number: pi.number }))"
      :options="results.map((r) => r.item)"
      :option-value="(pi) => ({ brand: pi.brand, number: pi.number })"
      :display-settings="PALETTE_CATALOG_DISPLAY_SETTINGS"
      multiple
      class="overflow-y-auto"
      @option-dblclick="({ palitem }) => handlePaletteCatalogOptionDoubleClick(palitem)"
    >
      <template #header>
        <div class="flex gap-x-1">
          <PaletteSelect
            ref="palette-select"
            size="md"
            variant="outline"
            class="w-full"
            @palette-loaded="selectedPalette = $event"
          />

          <DropdownMenu :items="paletteCatalogMenuOptions">
            <Button :loading="importingPalettes" color="neutral" variant="outline" :icon="IconMenu" />
          </DropdownMenu>
        </div>
      </template>

      <template #filter>
        <Input
          v-model="searchQuery"
          v-bind="$ta('palette-catalog-search')"
          size="md"
          variant="outline"
          :icon="IconSearch"
          class="w-full"
        />
      </template>

      <template #option="{ option, displaySettings }">
        <PaletteListItem
          :palette-item="option"
          :selected="palette.some((palitem) => palitem.eq(option))"
          :display-settings="displaySettings"
        />
      </template>
    </PaletteList>
  </PaletteSection>
</template>
