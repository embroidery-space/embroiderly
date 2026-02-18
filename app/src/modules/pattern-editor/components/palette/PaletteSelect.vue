<script setup lang="ts">
import type { SelectMenuItem } from "@nuxt/ui";
import { ref, onMounted, shallowRef, watch } from "vue";

import { FilesApi } from "#pattern-editor/api";
import type { BrandPaletteItem } from "#pattern-editor/lib/pattern";
import { useI18n } from "#shared/composables/";
import { LoggerService } from "#shared/services/";

const emit = defineEmits<{
  paletteSelected: [group: string, name: string];
  paletteLoaded: [paletteItems: BrandPaletteItem[]];
}>();

const { fluent } = useI18n();
const toast = useToast();

const paletteCatalog = new Map<string, BrandPaletteItem[]>();
const paletteCatalogOptions = shallowRef<SelectMenuItem[][]>([]);

const selectedPaletteKey = ref("system/DMC");

const loadingPalette = ref(false);
watch(selectedPaletteKey, loadPalette, { immediate: true });

async function loadPalettesList() {
  const { system, custom } = await FilesApi.getPalettesList();

  const systemPalettes: SelectMenuItem[] = [{ label: fluent.$t("files-group-system"), type: "label" }];
  for (const palette of system) systemPalettes.push({ label: palette, value: `system/${palette}` });

  const customPalettes: SelectMenuItem[] = [{ label: fluent.$t("files-group-custom"), type: "label" }];
  for (const palette of custom) customPalettes.push({ label: palette, value: `custom/${palette}` });

  paletteCatalogOptions.value = [systemPalettes, customPalettes];
}

async function loadPalette(key: string) {
  const [group, name] = key.split("/") as [string, string];
  emit("paletteSelected", group, name);

  try {
    let palette = paletteCatalog.get(key);
    if (!palette) {
      loadingPalette.value = true;

      palette = await FilesApi.loadPalette(group, name);

      paletteCatalog.set(key, palette);
    }

    emit("paletteLoaded", palette);
  } catch (err) {
    LoggerService.error(`Failed to load palette ${key}: ${err}`);
    toast.add({ title: fluent.$t("palette-catalog-load-failure"), color: "error" });
  } finally {
    loadingPalette.value = false;
  }
}

defineExpose({
  loadPalettesList,
  loadPalette,
});

onMounted(async () => {
  await loadPalettesList();
});
</script>

<template>
  <USelectMenu
    v-model="selectedPaletteKey"
    :loading="loadingPalette"
    :items="paletteCatalogOptions"
    value-key="value"
  />
</template>
