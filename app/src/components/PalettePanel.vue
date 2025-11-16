<template>
  <div
    v-shortcuts.escape="() => (paletteIsBeingEdited = false)"
    class="flex h-full"
    :class="{ 'border-2 border-primary': paletteIsBeingEdited }"
  >
    <UContextMenu
      :items="paletteIsBeingEdited ? paletteEditingContextMenuOptions : paletteContextMenuOptions"
      @update:open="(isOpen) => !isOpen && updatePaletteDisplaySettings()"
    >
      <PaletteList
        v-model="appStateStore.selectedPaletteItemIndex"
        :options="patternsStore.pattern?.palette.itemsInVisualOrder"
        :option-value="(pi) => pi.index"
        :display-settings="paletteDisplaySettings"
        :disabled="paletteIsDisabled"
        :draggable="paletteIsBeingEdited"
        class="grow"
        @reorder="({ oldPosition, newPosition }) => patternsStore.reorderPaletteItems(oldPosition, newPosition)"
      >
        <template #header>
          <div v-if="paletteIsBeingEdited" class="flex gap-x-1" @contextmenu.stop.prevent>
            <UButton
              icon="i-lucide:check"
              :label="$t('palette-save')"
              class="grow justify-center text-sm"
              @click="paletteIsBeingEdited = false"
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
              {{ $t("palette-size", { size: patternsStore.pattern?.palette.length ?? 0 }) }}
            </span>
            <UTooltip
              :text="paletteIsBeingEdited ? $t('palette-save') : $t('palette-edit')"
              :delay-duration="200"
              :disabled="paletteIsDisabled"
            >
              <UButton
                variant="ghost"
                color="neutral"
                size="xs"
                :disabled="paletteIsDisabled"
                :icon="paletteIsBeingEdited ? 'i-lucide:check' : 'i-lucide:pen'"
                @click="
                  () => {
                    paletteIsBeingEdited = !paletteIsBeingEdited;
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
      v-if="patternsStore.pattern?.palette && sectionVisibility.paletteCatalog"
      :palette="patternsStore.pattern.palette.items"
      class="min-w-max border-l border-default"
      @close="sectionVisibility.paletteCatalog = false"
      @add-palette-item="patternsStore.addPaletteItem"
      @remove-palette-item="patternsStore.removePaletteItem"
    />

    <StitchSymbols
      v-if="patternsStore.pattern?.palette && sectionVisibility.stitchSymbols"
      :symbols="
        patternsStore.pattern.palette.items
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

  import { PaletteSettings, SortPaletteBy, Symbol } from "~/core/pattern/";

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();

  const { fluent } = useI18n();
  const toast = useToast();

  const paletteIsDisabled = computed(() => !patternsStore.pattern);
  const paletteIsBeingEdited = ref(false);

  const sectionVisibility = reactive({
    paletteDisplaySettings: false,
    paletteCatalog: false,
    stitchSymbols: false,
  });

  const paletteDisplaySettings = ref(PaletteSettings.default());
  watch(
    () => patternsStore.pattern?.paletteDisplaySettings,
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
            paletteIsBeingEdited.value = true;
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
    const palsize = patternsStore.pattern?.palette.length ?? 0;
    return [
      palettePanelsMenuOptions.value,
      [
        {
          label: fluent.$t("palette-ctx-menu-sort-by"),
          disabled: !palsize,
          children: [
            {
              label: fluent.$t("palette-ctx-menu-sort-by-brand-and-number"),
              onSelect: () => patternsStore.sortPaletteBy(SortPaletteBy.BrandAndNumber),
            },
          ],
        },
      ],
      [
        {
          label: fluent.$t("palette-ctx-menu-delete-selected", {
            selected: appStateStore.selectedPaletteItemIndex === undefined ? 0 : 1,
          }),
          disabled: !palsize || appStateStore.selectedPaletteItemIndex === undefined,
          onSelect: () => {
            if (appStateStore.selectedPaletteItemIndex !== undefined) {
              patternsStore.removePaletteItem(appStateStore.selectedPaletteItemIndex);
            }
          },
        },
        {
          label: fluent.$t("palette-ctx-menu-delete-all"),
          disabled: !palsize,
          onSelect: () => {
            if (palsize) {
              patternsStore.removePaletteItem(...Array.from({ length: palsize }).keys());
            }
          },
        },
      ],
      [{ label: fluent.$t("palette-save"), onSelect: () => (paletteIsBeingEdited.value = false) }],
    ];
  });

  const palettePanelsMenuOptions = computed<DropdownMenuItem[]>(() => [
    {
      label: fluent.$t("palette-display-options"),
      onSelect: () => {
        paletteIsBeingEdited.value = true;
        sectionVisibility.paletteDisplaySettings = !sectionVisibility.paletteDisplaySettings;
      },
    },
    {
      label: fluent.$t("palette-catalog"),
      onSelect: () => {
        paletteIsBeingEdited.value = true;
        sectionVisibility.paletteCatalog = !sectionVisibility.paletteCatalog;
      },
    },
    {
      label: fluent.$t("stitch-symbols"),
      onSelect: () => {
        paletteIsBeingEdited.value = true;
        sectionVisibility.stitchSymbols = !sectionVisibility.stitchSymbols;
      },
    },
  ]);

  function handleSetSymbol({ fontFamily, codePoint }: { fontFamily: string; codePoint: number }) {
    if (appStateStore.selectedPaletteItemIndex === undefined) {
      toast.add({ title: fluent.$t("stitch-symbols-no-palitem-selected"), color: "warning" });
      return;
    }

    // Check if this symbol is already assigned to another palette item.
    const existingItem = patternsStore.pattern?.palette.items.find(
      (pi) => pi.symbol?.font === fontFamily && pi.symbol?.code === codePoint,
    );
    if (existingItem && existingItem.index !== appStateStore.selectedPaletteItemIndex) {
      toast.add({ title: fluent.$t("stitch-symbols-already-assigned"), color: "warning" });
      return;
    }

    const symbol = new Symbol({ code: codePoint, font: fontFamily });
    patternsStore.setPaletteItemSymbol(appStateStore.selectedPaletteItemIndex, symbol);
  }

  function handleUnsetSymbol({ fontFamily, codePoint }: { fontFamily: string; codePoint: number }) {
    // Find the palette item that has this symbol.
    const paletteItem = patternsStore.pattern?.palette.items.find(
      (pi) => pi.symbol?.font === fontFamily && pi.symbol?.code === codePoint,
    );
    if (!paletteItem) return;

    patternsStore.setPaletteItemSymbol(paletteItem.index, undefined);
  }

  watch(paletteIsBeingEdited, async (value) => {
    patternsStore.blocked = value;
    if (!value) {
      sectionVisibility.paletteDisplaySettings = false;
      sectionVisibility.paletteCatalog = false;
      sectionVisibility.stitchSymbols = false;
      await updatePaletteDisplaySettings();
    }
  });

  async function updatePaletteDisplaySettings() {
    await patternsStore.updatePaletteDisplaySettings(paletteDisplaySettings.value);
  }
</script>
