<script setup lang="ts">
import { Button, ContextMenu, DropdownMenu, Select, useConfirm, useToast } from "@embroiderly/ui";
import type { ContextMenuItem, DropdownMenuItem, SelectItem } from "@embroiderly/ui";

import { computed, onMounted, ref, shallowRef } from "vue";

import { FilesApi } from "~/api/";
import { IconMenu } from "~/assets/icons/";
import { useFilePicker, useI18n } from "~/composables/";
import { FONT_FILTER } from "~/constants/";
import { LoggerService } from "~/services/";
import { addSymbolFonts } from "~/utils/font-face.ts";

import { PaletteSection } from "../palette/";

import SymbolsList from "./SymbolsList.vue";

const { symbols = [] } = defineProps<{
  symbols?: { fontFamily: string; codePoint: number }[];
}>();
const emit = defineEmits<{
  setSymbol: [{ fontFamily: string; codePoint: number }];
  unsetSymbol: [{ fontFamily: string; codePoint: number }];
}>();

const confirm = useConfirm();
const filePicker = useFilePicker();
const { fluent } = useI18n();
const toast = useToast();

const selectedSymbol = ref<number | undefined>(undefined);
const assignedSymbols = computed(() => {
  const currentFontFamily = selectedFontKey.value.split("/")[1];
  return symbols.filter((s) => s.fontFamily === currentFontFamily).map((s) => s.codePoint);
});

const contextMenuOptions = computed<ContextMenuItem[][]>(() => {
  const targetSymbol = selectedSymbol.value;

  const hasTargetSymbol = targetSymbol !== undefined;
  const isAssigned = assignedSymbols.value.includes(targetSymbol!);

  return [
    [
      {
        label: fluent.$t("stitch-symbols-ctx-menu-set-symbol"),
        disabled: !hasTargetSymbol || isAssigned,
        onSelect: () => handleSetSymbol(targetSymbol!),
      },
      {
        label: fluent.$t("stitch-symbols-ctx-menu-unset-symbol"),
        disabled: !hasTargetSymbol || !isAssigned,
        onSelect: () => handleUnsetSymbol(targetSymbol!),
      },
    ],
  ];
});

const loadingFont = ref(false);
const importingFonts = ref(false);

const loadedFonts = new Map<string, number[]>();
const symbolFontOptions = shallowRef<SelectItem[][]>([]);

const selectedFontKey = ref("system/ursasoftware");
const selectedCodePoints = shallowRef<number[]>([]);

const symbolFontMenuOptions = computed<DropdownMenuItem[]>(() => [
  {
    label: fluent.$t("stitch-symbols-menu-import-fonts"),
    onSelect: importSymbolFonts,
    loading: importingFonts.value,
  },
]);

async function refreshFontsList() {
  const { system, custom } = await FilesApi.getSymbolFontsList();

  const systemFonts: SelectItem[] = [{ label: fluent.$t("files-group-system"), type: "label" }];
  for (const fontFamily of system) {
    const fontKey = `system/${fontFamily}`;
    systemFonts.push({ label: fontFamily, value: fontKey });
  }

  const customFonts: SelectItem[] = [{ label: fluent.$t("files-group-custom"), type: "label" }];
  for (const fontFamily of custom) {
    const fontKey = `custom/${fontFamily}`;
    customFonts.push({ label: fontFamily, value: fontKey });
  }

  symbolFontOptions.value = [systemFonts, customFonts];
}

async function loadFont(fontGroup: string, fontFamily: string) {
  const fontKey = `${fontGroup}/${fontFamily}`;
  try {
    let codePoints = loadedFonts.get(fontKey);
    if (!codePoints) {
      loadingFont.value = true;
      const [fontFace, loadedCodePoints] = await Promise.all([
        FilesApi.loadSymbolFont(fontFamily),
        FilesApi.loadSymbolFontCodePoints(fontFamily),
      ]);
      addSymbolFonts(fontFace);
      codePoints = loadedCodePoints;
      loadedFonts.set(fontKey, codePoints);
    }
    selectedCodePoints.value = codePoints;
  } catch (err) {
    LoggerService.error(`Failed to load font ${fontKey}: ${err}`);
    toast.add({ title: fluent.$t("stitch-symbol-font-load-failure", { font: fontFamily }), color: "error" });
  } finally {
    loadingFont.value = false;
  }
}

/** Imports selected symbol fonts. */
async function importSymbolFonts() {
  const paths = (await filePicker.open({ multiple: true, filters: FONT_FILTER })) as string[] | null;
  if (!paths) return;

  try {
    importingFonts.value = true;

    const { failedFiles } = await FilesApi.importSymbolFonts(paths);
    await refreshFontsList();

    if (failedFiles.length) {
      confirm.open(
        fluent.$ta("stitch-symbols-import-failed-files", {
          failedFilesList: failedFiles.map((file) => `- ${file}`).join("\n"),
        }),
      );
    } else toast.add({ title: fluent.$t("stitch-symbols-import-success"), color: "success" });
  } catch (err) {
    LoggerService.error(`Failed to import symbol fonts: ${err}`);
    toast.add({ title: fluent.$t("stitch-symbols-import-failure"), color: "error" });
  } finally {
    importingFonts.value = false;
  }
}

function handleSetSymbol(codePoint: number) {
  const fontFamily = selectedFontKey.value.split("/")[1]!;
  emit("setSymbol", { fontFamily, codePoint });
}

function handleUnsetSymbol(codePoint: number) {
  const fontFamily = selectedFontKey.value.split("/")[1]!;
  emit("unsetSymbol", { fontFamily, codePoint });
}

onMounted(async () => {
  await refreshFontsList();
  await loadFont("system", "Ursasoftware");
});
</script>

<template>
  <PaletteSection :title="$t('stitch-symbols')">
    <ContextMenu :items="contextMenuOptions">
      <SymbolsList
        v-model:selected-symbol="selectedSymbol"
        :assigned-symbols="assignedSymbols"
        :options="selectedCodePoints"
        :font-family="selectedFontKey.split('/')[1]"
        scroll-type="always"
        @option-dblclick="handleSetSymbol($event.codePoint)"
      >
        <template #header>
          <div class="flex gap-x-1">
            <Select
              v-model="selectedFontKey"
              :loading="loadingFont"
              :items="symbolFontOptions"
              size="md"
              variant="outline"
              class="w-full"
              @update:model-value="
                async (key) => {
                  const [fontGroup, fontFamily] = (key as string).split('/') as [string, string];
                  await loadFont(fontGroup, fontFamily);
                }
              "
            />

            <DropdownMenu :items="symbolFontMenuOptions">
              <Button :loading="importingFonts" color="neutral" variant="outline" :icon="IconMenu" />
            </DropdownMenu>
          </div>
        </template>

        <template #footer>
          <span class="text-sm text-nowrap">
            {{ $t("stitch-symbols-usage", { total: selectedCodePoints.length, used: assignedSymbols.length }) }}
          </span>
        </template>
      </SymbolsList>
    </ContextMenu>
  </PaletteSection>
</template>
