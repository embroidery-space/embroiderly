<template>
  <PaletteSection :title="$t('label-palette-colors')">
    <PaletteList
      :model-value="palette.map((pi) => ({ brand: pi.brand, number: pi.number }))"
      :options="selectedPalette"
      :option-value="(pi) => ({ brand: pi.brand, number: pi.number })"
      :display-settings="PALETTE_CATALOG_DISPLAY_SETTINGS"
      multiple
      meta-key-selection
      class="overflow-y-auto"
      @option-dblclick="({ palitem }) => handlePaletteCatalogOptionDoubleClick(palitem)"
    >
      <template #header>
        <div class="flex gap-x-1">
          <USelectMenu
            v-model="selectedPaletteKey"
            :loading="loadingPalette"
            :items="paletteCatalogOptions"
            value-key="value"
            size="md"
            class="w-full"
            @update:model-value="
              async (key: string) => {
                const [brand, name] = key.split('/') as [string, string];
                await loadPalette(brand, name);
              }
            "
          />

          <UDropdownMenu :items="paletteCatalogMenuOptions">
            <UButton :loading="importingPalettes" color="neutral" variant="outline" icon="i-lucide:menu" />
          </UDropdownMenu>
        </div>
      </template>

      <template #option="{ option, displaySettings }">
        <PaletteListItem
          :palette-item="option"
          :selected="palette.find((palitem) => palitem.compare(option)) !== undefined"
          :display-settings="displaySettings"
        />
      </template>
    </PaletteList>
  </PaletteSection>
</template>

<script setup lang="ts">
  import type { DropdownMenuItem, SelectMenuItem } from "@nuxt/ui";
  import { onMounted, ref, computed, type Ref } from "vue";

  import { PaletteApi } from "~/api";
  import { BrandPaletteItem, PaletteItem, PaletteSettings } from "~/core/pattern/";

  const PALETTE_CATALOG_DISPLAY_SETTINGS = new PaletteSettings({
    columnsNumber: 4,
    colorOnly: false,
    showColorBrands: false,
    showColorNumbers: true,
    showColorNames: false,
  });

  const confirm = useConfirm();
  const filePicker = useFilePicker();
  const fluent = useFluent();
  const toast = useToast();

  const { palette } = defineProps<{ palette: PaletteItem[] }>();
  const emit = defineEmits<{
    addPaletteItem: [palitem: PaletteItem];
    removePaletteItem: [palindex: number];
  }>();

  const loadingPalette = ref(false);
  const importingPalettes = ref(false);

  const paletteCatalog = new Map<string, BrandPaletteItem[] | undefined>();
  const paletteCatalogOptions = ref<SelectMenuItem[][]>([]);

  const selectedPaletteKey = ref("system/DMC");
  const selectedPalette: Ref<BrandPaletteItem[]> = ref([]);

  const paletteCatalogMenuOptions = computed<DropdownMenuItem[]>(() => [
    {
      label: fluent.$t("label-palette-catalog-menu-import-palettes"),
      onSelect: importPalettes,
      loading: importingPalettes.value,
    },
  ]);

  async function refreshPalettesList() {
    const { system, custom } = await PaletteApi.getPalettesList();

    const systemPalettes: SelectMenuItem[] = [
      { label: fluent.$t("label-palette-catalog-group-system"), type: "label" },
    ];
    for (const palette of system) {
      const paletteKey = `system/${palette}`;
      systemPalettes.push({ label: palette, value: paletteKey });
      paletteCatalog.set(paletteKey, undefined);
    }

    const customPalettes: SelectMenuItem[] = [
      { label: fluent.$t("label-palette-catalog-group-custom"), type: "label" },
    ];
    for (const palette of custom) {
      const paletteKey = `custom/${palette}`;
      customPalettes.push({ label: palette, value: paletteKey });
      paletteCatalog.set(paletteKey, undefined);
    }

    paletteCatalogOptions.value = [systemPalettes, customPalettes];
  }

  async function loadPalette(paletteGroup: string, paletteName: string) {
    const paletteKey = `${paletteGroup}/${paletteName}`;
    try {
      let palette = paletteCatalog.get(paletteKey);
      if (!palette) {
        loadingPalette.value = true;
        palette = await PaletteApi.loadPalette(paletteGroup, paletteName);
        paletteCatalog.set(paletteKey, palette);
      }
      selectedPalette.value = palette;
    } catch (err) {
      error(`Failed to load palette ${paletteKey}: ${err}`);
      toast.add({ title: fluent.$t("message-palette-load-error", { paletteKey }), color: "error" });
    } finally {
      loadingPalette.value = false;
    }
  }

  /** Imports selected palette files. */
  async function importPalettes() {
    const paths = (await filePicker.open({ multiple: true, filters: filePicker.PALETTE_FILTER })) as string[] | null;
    if (!paths) return;

    try {
      importingPalettes.value = true;

      const { failedFiles } = await PaletteApi.importPalettes(paths);
      await refreshPalettesList();

      if (failedFiles.length) {
        confirm.open({
          title: fluent.$t("title-failed-palette-files"),
          message: fluent.$t("message-failed-palette-files", {
            failedFilesList: failedFiles.map((file) => `- ${file}`).join("\n"),
          }),
        });
      } else toast.add({ title: fluent.$t("message-palette-import-success"), color: "success" });
    } catch (err) {
      error(`Failed to import palettes: ${err}`);
      toast.add({ title: fluent.$t("message-palette-import-error"), color: "error" });
    } finally {
      importingPalettes.value = false;
    }
  }

  function handlePaletteCatalogOptionDoubleClick(option: BrandPaletteItem) {
    const palindex = palette.findIndex((palitem) => palitem.compare(option));
    if (palindex !== -1) emit("removePaletteItem", palindex);
    else emit("addPaletteItem", option);
  }

  onMounted(async () => {
    await refreshPalettesList();
    await loadPalette("system", "DMC"); // Load default system palette.
  });
</script>
