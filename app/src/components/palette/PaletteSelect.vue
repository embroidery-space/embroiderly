<script setup lang="ts">
import { Select, useToast } from "@embroiderly/ui";
import type { SelectProps, SelectItem } from "@embroiderly/ui";

import { ref, onMounted, shallowRef, watch } from "vue";

import { useEditor, useI18n } from "~/composables/";
import { deserializeBrandPalette } from "~/lib/pattern/";
import type { BrandPaletteItem } from "~/lib/pattern/";
import { LoggerService } from "~/services/";

const props = defineProps<Pick<SelectProps, "color" | "variant" | "size">>();
const emits = defineEmits<{
  paletteSelected: [group: string, name: string];
  paletteLoaded: [palette: BrandPaletteItem[]];
}>();

const { files } = useEditor();
const { fluent } = useI18n();
const toast = useToast();

const paletteCatalog = new Map<string, BrandPaletteItem[]>();
const paletteCatalogOptions = shallowRef<SelectItem[][]>([]);

const selectedPaletteKey = ref("system/DMC");

const loadingPalette = ref(false);
watch(selectedPaletteKey, loadPalette, { immediate: true });

async function loadPalettesList() {
  const { system, custom } = await files.getPalettesList();

  const systemPalettes: SelectItem[] = [{ label: fluent.$t("files-group-system"), type: "label" }];
  for (const palette of system) systemPalettes.push({ label: palette, value: `system/${palette}` });

  const customPalettes: SelectItem[] = [{ label: fluent.$t("files-group-custom"), type: "label" }];
  for (const palette of custom) customPalettes.push({ label: palette, value: `custom/${palette}` });

  paletteCatalogOptions.value = [systemPalettes, customPalettes];
}

async function loadPalette(key: string) {
  const [group, name] = key.split("/") as [string, string];
  emits("paletteSelected", group, name);

  try {
    let palette = paletteCatalog.get(key);
    if (!palette) {
      loadingPalette.value = true;

      palette = deserializeBrandPalette(await files.loadPalette(group, name));

      paletteCatalog.set(key, palette);
    }

    emits("paletteLoaded", palette);
  } catch (err) {
    LoggerService.error(`Failed to load palette ${key}: ${err}`);
    toast.add({ title: fluent.$t("palette-catalog-load-failure", { palette: key }), color: "error" });
  } finally {
    loadingPalette.value = false;
  }
}

defineExpose({
  loadPalettesList,
  loadPalette,
});

onMounted(() => loadPalettesList());
</script>

<template>
  <Select v-model="selectedPaletteKey" v-bind="props" :loading="loadingPalette" :items="paletteCatalogOptions" />
</template>
