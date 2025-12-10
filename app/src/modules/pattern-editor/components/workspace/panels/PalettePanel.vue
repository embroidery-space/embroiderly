<template>
  <div
    v-shortcuts.escape="() => (editorStateStore.paletteMode = PaletteMode.Regular)"
    class="flex h-full"
    :class="{ 'border-2 border-primary': editorStateStore.paletteMode === PaletteMode.Editing }"
  >
    <UContextMenu
      :items="
        editorStateStore.paletteMode === PaletteMode.Editing
          ? paletteEditingContextMenuOptions
          : paletteContextMenuOptions
      "
      @update:open="(isOpen) => !isOpen && updatePaletteDisplaySettings()"
    >
      <PaletteList
        v-model="editorStateStore.selectedPaletteItemIndex"
        :options="patternStore.pattern?.palette.itemsInVisualOrder"
        :option-value="(pi) => pi.index"
        :display-settings="paletteDisplaySettings"
        :disabled="paletteIsDisabled"
        :draggable="editorStateStore.paletteMode === PaletteMode.Editing"
        class="grow"
        @reorder="({ oldPosition, newPosition }) => patternStore.reorderPaletteItems(oldPosition, newPosition)"
      >
        <template #header>
          <div
            v-if="editorStateStore.paletteMode === PaletteMode.Editing"
            class="flex gap-x-1"
            @contextmenu.stop.prevent
          >
            <UButton
              icon="i-lucide:check"
              :label="$t('palette-save')"
              class="grow justify-center text-sm"
              @click="editorStateStore.paletteMode = PaletteMode.Regular"
            />
            <UDropdownMenu :items="palettePanelsMenuOptions">
              <UButton icon="i-lucide:menu" />
            </UDropdownMenu>
          </div>
          <PaletteToolbar v-else :disabled="paletteIsDisabled" @contextmenu.stop.prevent />
        </template>

        <template #option="{ option: paletteItem, selected, displaySettings }">
          <PaletteListItem :palette-item="paletteItem" :selected="selected" :display-settings="displaySettings">
            <template v-if="!displaySettings.colorOnly && displaySettings.showStitchSymbols">
              <span
                v-if="paletteItem.symbol"
                class="mr-2 inline-flex size-5 shrink-0 items-center justify-center"
                :class="{
                  'rounded-sm bg-white text-black': displaySettings.stitchSymbolsOnContrastBackground,
                }"
                :style="{ fontFamily: paletteItem.symbol.font }"
              >
                {{ paletteItem.symbol.char }}
              </span>
              <!-- If the palete item doesn't have a stitch symbol, render an empty `span`, so that the title is properly aligned with those with symbols. -->
              <span v-else class="mr-2 size-5 shrink-0"></span>
            </template>
          </PaletteListItem>
        </template>

        <template #footer>
          <div class="flex items-center justify-between" @contextmenu.stop.prevent>
            <span class="text-sm text-nowrap">
              {{ $t("palette-size", { size: patternStore.pattern?.palette.length ?? 0 }) }}
            </span>
            <UTooltip
              :text="editorStateStore.paletteMode === PaletteMode.Editing ? $t('palette-save') : $t('palette-edit')"
              :delay-duration="200"
              :disabled="paletteIsDisabled"
            >
              <UButton
                variant="ghost"
                color="neutral"
                size="xs"
                :disabled="paletteIsDisabled"
                :icon="editorStateStore.paletteMode === PaletteMode.Editing ? 'i-lucide:check' : 'i-lucide:pen'"
                @click="
                  () => {
                    editorStateStore.paletteMode = PaletteMode.Regular;
                    sectionVisibility.paletteCatalog = true;
                  }
                "
              />
            </UTooltip>
          </div>
        </template>
      </PaletteList>
    </UContextMenu>

    <PaletteDisplaySettings
      v-if="sectionVisibility.paletteDisplaySettings"
      v-model:settings="paletteDisplaySettings"
      class="border-l border-default"
      @close="sectionVisibility.paletteDisplaySettings = false"
    />

    <PaletteCatalog
      v-if="patternStore.pattern?.palette && sectionVisibility.paletteCatalog"
      :palette="patternStore.pattern.palette.items"
      class="min-w-max border-l border-default"
      @close="sectionVisibility.paletteCatalog = false"
      @add-palette-item="patternStore.addPaletteItem"
      @remove-palette-item="patternStore.removePaletteItem"
    />

    <StitchSymbols
      v-if="patternStore.pattern?.palette && sectionVisibility.stitchSymbols"
      :symbols="
        patternStore.pattern.palette.items
          .filter((pi) => pi.symbol !== undefined)
          .map((pi) => ({
            codePoint: pi.symbol!.code,
            fontFamily: pi.symbol!.font,
          }))
      "
      class="min-w-max border-l border-default"
      @close="sectionVisibility.stitchSymbols = false"
      @set-symbol="handleSetSymbol"
      @unset-symbol="handleUnsetSymbol"
    />
  </div>
</template>

<script setup lang="ts">
  import type { ContextMenuItem, DropdownMenuItem } from "@nuxt/ui";
  import { computed, reactive, ref, watch } from "vue";

  import {
    PaletteCatalog,
    PaletteDisplaySettings,
    PaletteList,
    PaletteListItem,
    PaletteToolbar,
  } from "#pattern-editor/components/palette/";
  import { StitchSymbols } from "#pattern-editor/components/symbols/";
  import { PaletteSettings, SortPaletteBy, Symbol } from "#pattern-editor/lib/pattern/";
  import { PaletteMode, useEditorStateStore, usePatternStore } from "#pattern-editor/stores/";
  import { useI18n } from "#shared/composables/";
  import { vShortcuts } from "#shared/directives/";

  const editorStateStore = useEditorStateStore();
  const patternStore = usePatternStore();

  const { fluent } = useI18n();
  const toast = useToast();

  const paletteIsDisabled = computed(() => !patternStore.pattern);

  const sectionVisibility = reactive({
    paletteDisplaySettings: false,
    paletteCatalog: false,
    stitchSymbols: false,
  });

  const paletteDisplaySettings = ref(PaletteSettings.default());
  watch(
    () => patternStore.pattern?.paletteDisplaySettings,
    (settings) => {
      if (settings) paletteDisplaySettings.value = settings;
    },
    { immediate: true },
  );

  const paletteContextMenuOptions = computed<ContextMenuItem[][]>(() => {
    const {
      columnsNumber,
      colorOnly,
      showStitchSymbols,
      stitchSymbolsOnContrastBackground,
      showColorBrands,
      showColorNumbers,
      showColorNames,
    } = paletteDisplaySettings.value;
    return [
      [
        {
          label: fluent.$t("palette-edit"),
          onSelect: (event) => {
            event.preventDefault();
            editorStateStore.paletteMode = PaletteMode.Editing;
          },
        },
      ],
      [
        {
          label: fluent.$t("palette-display-options"),
          children: [
            [
              {
                label: fluent.$t("palette-columns-number"),
                children: [1, 2, 3, 4, 5, 6, 7, 8].map<ContextMenuItem>((n) => ({
                  label: n.toString(),
                  type: "checkbox",
                  checked: columnsNumber === n,
                  onSelect: (event) => {
                    event.preventDefault();
                    paletteDisplaySettings.value = {
                      ...paletteDisplaySettings.value,
                      columnsNumber: n,
                    };
                  },
                })),
              },
            ],
            [
              {
                label: fluent.$t("palette-color-only"),
                type: "checkbox",
                checked: colorOnly,
                onSelect: (event) => {
                  event.preventDefault();
                  paletteDisplaySettings.value = {
                    ...paletteDisplaySettings.value,
                    colorOnly: !colorOnly,
                  };
                },
              },
            ],
            [
              {
                label: fluent.$t("palette-show-stitch-symbols"),
                type: "checkbox",
                checked: showStitchSymbols,
                disabled: colorOnly,
                onSelect: (event) => {
                  event.preventDefault();
                  paletteDisplaySettings.value = {
                    ...paletteDisplaySettings.value,
                    showStitchSymbols: !showStitchSymbols,
                  };
                },
              },
              {
                label: fluent.$t("palette-contrast-stitch-symbols"),
                type: "checkbox",
                checked: stitchSymbolsOnContrastBackground,
                disabled: colorOnly,
                onSelect: (event) => {
                  event.preventDefault();
                  paletteDisplaySettings.value = {
                    ...paletteDisplaySettings.value,
                    stitchSymbolsOnContrastBackground: !stitchSymbolsOnContrastBackground,
                  };
                },
              },
            ],
            [
              {
                label: fluent.$t("palette-show-brand"),
                type: "checkbox",
                checked: showColorBrands,
                disabled: colorOnly,
                onSelect: (event) => {
                  event.preventDefault();
                  paletteDisplaySettings.value = {
                    ...paletteDisplaySettings.value,
                    showColorBrands: !showColorBrands,
                  };
                },
              },
              {
                label: fluent.$t("palette-show-number"),
                type: "checkbox",
                checked: showColorNumbers,
                disabled: colorOnly,
                onSelect: (event) => {
                  event.preventDefault();
                  paletteDisplaySettings.value = {
                    ...paletteDisplaySettings.value,
                    showColorNumbers: !showColorNumbers,
                  };
                },
              },
              {
                label: fluent.$t("palette-show-name"),
                type: "checkbox",
                checked: showColorNames,
                disabled: colorOnly,
                onSelect: (event) => {
                  event.preventDefault();
                  paletteDisplaySettings.value = {
                    ...paletteDisplaySettings.value,
                    showColorNames: !showColorNames,
                  };
                },
              },
            ],
          ],
        },
      ],
    ];
  });
  const paletteEditingContextMenuOptions = computed<ContextMenuItem[][]>(() => {
    const palsize = patternStore.pattern?.palette.length ?? 0;
    return [
      palettePanelsMenuOptions.value,
      [
        {
          label: fluent.$t("palette-ctx-menu-sort-by"),
          disabled: !palsize,
          children: [
            {
              label: fluent.$t("palette-ctx-menu-sort-by-brand-and-number"),
              onSelect: () => patternStore.sortPaletteBy(SortPaletteBy.BrandAndNumber),
            },
          ],
        },
      ],
      [
        {
          label: fluent.$t("palette-ctx-menu-delete-selected", {
            selected: editorStateStore.selectedPaletteItemIndex === undefined ? 0 : 1,
          }),
          disabled: !palsize || editorStateStore.selectedPaletteItemIndex === undefined,
          onSelect: () => {
            if (editorStateStore.selectedPaletteItemIndex !== undefined) {
              patternStore.removePaletteItem(editorStateStore.selectedPaletteItemIndex);
            }
          },
        },
        {
          label: fluent.$t("palette-ctx-menu-delete-all"),
          disabled: !palsize,
          onSelect: () => {
            if (palsize) {
              patternStore.removePaletteItem(...Array.from({ length: palsize }).keys());
            }
          },
        },
      ],
      [{ label: fluent.$t("palette-save"), onSelect: () => (editorStateStore.paletteMode = PaletteMode.Regular) }],
    ];
  });

  const palettePanelsMenuOptions = computed<DropdownMenuItem[]>(() => [
    {
      label: fluent.$t("palette-display-options"),
      onSelect: () => {
        editorStateStore.paletteMode = PaletteMode.Editing;
        sectionVisibility.paletteDisplaySettings = !sectionVisibility.paletteDisplaySettings;
      },
    },
    {
      label: fluent.$t("palette-catalog"),
      onSelect: () => {
        editorStateStore.paletteMode = PaletteMode.Editing;
        sectionVisibility.paletteCatalog = !sectionVisibility.paletteCatalog;
      },
    },
    {
      label: fluent.$t("stitch-symbols"),
      onSelect: () => {
        editorStateStore.paletteMode = PaletteMode.Editing;
        sectionVisibility.stitchSymbols = !sectionVisibility.stitchSymbols;
      },
    },
  ]);

  function handleSetSymbol({ fontFamily, codePoint }: { fontFamily: string; codePoint: number }) {
    if (editorStateStore.selectedPaletteItemIndex === undefined) {
      toast.add({ title: fluent.$t("stitch-symbols-no-palitem-selected"), color: "warning" });
      return;
    }

    // Check if this symbol is already assigned to another palette item.
    const existingItem = patternStore.pattern?.palette.items.find(
      (pi) => pi.symbol?.font === fontFamily && pi.symbol?.code === codePoint,
    );
    if (existingItem && existingItem.index !== editorStateStore.selectedPaletteItemIndex) {
      toast.add({ title: fluent.$t("stitch-symbols-already-assigned"), color: "warning" });
      return;
    }

    const symbol = new Symbol({ code: codePoint, font: fontFamily });
    patternStore.setPaletteItemSymbol(editorStateStore.selectedPaletteItemIndex, symbol);
  }

  function handleUnsetSymbol({ fontFamily, codePoint }: { fontFamily: string; codePoint: number }) {
    // Find the palette item that has this symbol.
    const paletteItem = patternStore.pattern?.palette.items.find(
      (pi) => pi.symbol?.font === fontFamily && pi.symbol?.code === codePoint,
    );
    if (!paletteItem) return;

    patternStore.setPaletteItemSymbol(paletteItem.index, undefined);
  }

  watch(
    () => editorStateStore.paletteMode,
    async (value) => {
      if (value === PaletteMode.Regular) {
        sectionVisibility.paletteDisplaySettings = false;
        sectionVisibility.paletteCatalog = false;
        sectionVisibility.stitchSymbols = false;
        await updatePaletteDisplaySettings();
      }
    },
  );

  async function updatePaletteDisplaySettings() {
    await patternStore.updatePaletteDisplaySettings(paletteDisplaySettings.value);
  }
</script>
