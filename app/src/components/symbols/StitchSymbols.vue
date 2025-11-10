<template>
  <PanelSection :title="$t('label-stitch-symbols')">
    <UContextMenu :items="contextMenuOptions">
      <SymbolsList
        v-model:selected-symbol="selectedSymbol"
        :assigned-symbols="assignedSymbols"
        :options="selectedCodePoints"
        :font-family="selectedFontKey.split('/')[1]"
        class="overflow-y-auto"
        @option-dblclick="handleSetSymbol($event.codePoint)"
      >
        <template #header>
          <div class="flex gap-x-1">
            <USelectMenu
              v-model="selectedFontKey"
              :loading="loadingFont"
              :items="symbolFontOptions"
              value-key="value"
              size="md"
              class="w-full"
              @update:model-value="
                async (key: string) => {
                  const [fontGroup, fontFamily] = key.split('/') as [string, string];
                  await loadFont(fontGroup, fontFamily);
                }
              "
            />

            <UDropdownMenu :items="symbolFontMenuOptions">
              <UButton :loading="importingFonts" color="neutral" variant="outline" icon="i-lucide:menu" />
            </UDropdownMenu>
          </div>
        </template>

        <template #footer>
          <span class="text-sm text-nowrap">
            {{ $t("label-stitch-symbols-count", { total: selectedCodePoints.length, used: assignedSymbols.length }) }}
          </span>
        </template>
      </SymbolsList>
    </UContextMenu>
  </PanelSection>
</template>

<script setup lang="ts">
  import type { ContextMenuItem, DropdownMenuItem, SelectMenuItem } from "@nuxt/ui";
  import { computed, onMounted, ref, shallowRef } from "vue";

  import { FontsApi } from "~/api";
  import { addSymbolFonts } from "~/utils/font-face";

  const confirm = useConfirm();
  const filePicker = useFilePicker();
  const { fluent } = useI18n();
  const toast = useToast();

  const { symbols = [] } = defineProps<{
    symbols?: { fontFamily: string; codePoint: number }[];
  }>();
  const emit = defineEmits<{
    setSymbol: [{ fontFamily: string; codePoint: number }];
    unsetSymbol: [{ fontFamily: string; codePoint: number }];
  }>();

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
          label: fluent.$t("label-stitch-symbols-context-menu-set-symbol"),
          disabled: !hasTargetSymbol || isAssigned,
          onSelect: () => handleSetSymbol(targetSymbol!),
        },
        {
          label: fluent.$t("label-stitch-symbols-context-menu-unset-symbol"),
          disabled: !hasTargetSymbol || !isAssigned,
          onSelect: () => handleUnsetSymbol(targetSymbol!),
        },
      ],
    ];
  });

  const loadingFont = ref(false);
  const importingFonts = ref(false);

  const loadedFonts = new Map<string, number[]>();
  const symbolFontOptions = shallowRef<SelectMenuItem[][]>([]);

  const selectedFontKey = ref("system/Ursasoftware");
  const selectedCodePoints = shallowRef<number[]>([]);

  const symbolFontMenuOptions = computed<DropdownMenuItem[]>(() => [
    {
      label: fluent.$t("label-stitch-symbols-menu-import-fonts"),
      onSelect: importSymbolFonts,
      loading: importingFonts.value,
    },
  ]);

  async function refreshFontsList() {
    const { system, custom } = await FontsApi.getSymbolFontsList();

    const systemFonts: SelectMenuItem[] = [{ label: fluent.$t("label-files-system"), type: "label" }];
    for (const fontFamily of system) {
      const fontKey = `system/${fontFamily}`;
      systemFonts.push({ label: fontFamily, value: fontKey });
    }

    const customFonts: SelectMenuItem[] = [{ label: fluent.$t("label-files-custom"), type: "label" }];
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
          FontsApi.loadSymbolFont(fontFamily),
          FontsApi.loadSymbolFontCodePoints(fontFamily),
        ]);
        addSymbolFonts(fontFace);
        codePoints = loadedCodePoints;
        loadedFonts.set(fontKey, codePoints);
      }
      selectedCodePoints.value = codePoints;
    } catch (err) {
      error(`Failed to load font ${fontKey}: ${err}`);
      toast.add({ title: fluent.$t("message-symbol-font-load-error", { fontKey }), color: "error" });
    } finally {
      loadingFont.value = false;
    }
  }

  /** Imports selected symbol fonts. */
  async function importSymbolFonts() {
    const paths = (await filePicker.open({ multiple: true, filters: filePicker.FONT_FILTER })) as string[] | null;
    if (!paths) return;

    try {
      importingFonts.value = true;

      const { failedFiles } = await FontsApi.importSymbolFonts(paths);
      await refreshFontsList();

      if (failedFiles.length) {
        confirm.open({
          title: fluent.$t("title-failed-font-files"),
          message: fluent.$t("message-failed-font-files", {
            failedFilesList: failedFiles.map((file) => `- ${file}`).join("\n"),
          }),
        });
      } else {
        toast.add({ title: fluent.$t("message-symbol-fonts-import-success"), color: "success" });
      }
    } catch (err) {
      error(`Failed to import symbol fonts: ${err}`);
      toast.add({ title: fluent.$t("message-symbol-fonts-import-error"), color: "error" });
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
