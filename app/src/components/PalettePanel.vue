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
        :model-value="appStateStore.selectedPaletteItemIndexes"
        :options="patternsStore.pattern?.palette.itemsInVisualOrder"
        :option-value="(pi) => patternsStore.pattern?.palette.items.findIndex((cmp) => dequal(cmp, pi))!"
        :display-settings="paletteDisplaySettings"
        :disabled="paletteIsDisabled"
        :draggable="paletteIsBeingEdited"
        multiple
        class="grow"
        @update:model-value="handlePaletteItemsSelection"
        @reorder="({ oldPosition, newPosition }) => patternsStore.reorderPaletteItems(oldPosition, newPosition)"
      >
        <template #header>
          <div v-if="paletteIsBeingEdited" class="flex gap-x-1" @contextmenu.stop.prevent>
            <UButton
              icon="i-lucide:check"
              :label="$t('label-save-changes')"
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
                :style="{ fontFamily: getPaletteItemSymbolFontFamily(paletteItem) }"
              >
                {{ paletteItem.symbol }}
              </span>
              <!-- If the palete item doesn't have a stitch symbol, render an empty `span`, so that the title is properly aligned with those with symbols. -->
              <span v-else class="mr-2 size-5 shrink-0"></span>
            </template>
          </PaletteListItem>
        </template>

        <template #footer>
          <div class="flex items-center justify-between" @contextmenu.stop.prevent>
            <span class="text-sm text-nowrap">
              {{ $t("label-palette-size", { size: patternsStore.pattern?.palette.length ?? 0 }) }}
            </span>
            <UTooltip
              :text="paletteIsBeingEdited ? $t('label-save-changes') : $t('label-palette-edit')"
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
                    showPaletteCatalog = true;
                  }
                "
              />
            </UTooltip>
          </div>
        </template>
      </PaletteList>
    </UContextMenu>

    <PaletteCatalog
      v-if="patternsStore.pattern?.palette && showPaletteCatalog"
      :palette="patternsStore.pattern.palette.items"
      class="min-w-max border-l border-default"
      @close="showPaletteCatalog = false"
      @add-palette-item="patternsStore.addPaletteItem"
      @remove-palette-item="patternsStore.removePaletteItem"
    />

    <PaletteDisplaySettings
      v-if="showPaletteDisplaySettings"
      :settings="paletteDisplaySettings"
      class="border-l border-default"
      @update:settings="(value) => (paletteDisplaySettings = value)"
      @close="showPaletteDisplaySettings = false"
    />
  </div>
</template>

<script setup lang="ts">
  import type { ContextMenuItem, DropdownMenuItem } from "@nuxt/ui";
  import { dequal } from "dequal";
  import { computed, ref, watch } from "vue";

  import { PaletteItem, PaletteSettings, SortPaletteBy } from "~/core/pattern/";

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();

  const fluent = useFluent();

  const paletteIsDisabled = computed(() => !patternsStore.pattern);
  const paletteIsBeingEdited = ref(false);

  const showPaletteCatalog = ref(false);
  const showPaletteDisplaySettings = ref(false);

  const paletteDisplaySettings = ref(PaletteSettings.default());
  watch(
    () => patternsStore.pattern?.paletteDisplaySettings,
    (settings) => {
      if (settings) paletteDisplaySettings.value = settings;
    },
    { immediate: true },
  );

  const paletteContextMenuOptions = computed<ContextMenuItem[][]>(() => [
    [
      {
        label: fluent.$t("label-palette-edit"),
        onSelect: (event) => {
          event.preventDefault();
          paletteIsBeingEdited.value = true;
        },
      },
    ],
    [
      {
        label: fluent.$t("label-palette-display-options"),
        children: [
          [
            {
              label: fluent.$t("label-display-options-columns-number"),
              children: [1, 2, 3, 4, 5, 6, 7, 8].map<ContextMenuItem>((n) => ({
                label: n.toString(),
                type: "checkbox",
                checked: paletteDisplaySettings.value.columnsNumber === n,
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
              label: fluent.$t("label-display-options-color-only"),
              type: "checkbox",
              checked: paletteDisplaySettings.value.colorOnly,
              onSelect: (event) => {
                event.preventDefault();
                paletteDisplaySettings.value = {
                  ...paletteDisplaySettings.value,
                  colorOnly: !paletteDisplaySettings.value.colorOnly,
                };
              },
            },
          ],
          [
            {
              label: fluent.$t("label-display-options-show-stitch-symbols"),
              type: "checkbox",
              checked: paletteDisplaySettings.value.showStitchSymbols,
              disabled: paletteDisplaySettings.value.colorOnly,
              onSelect: (event) => {
                event.preventDefault();
                paletteDisplaySettings.value = {
                  ...paletteDisplaySettings.value,
                  showStitchSymbols: !paletteDisplaySettings.value.showStitchSymbols,
                };
              },
            },
            {
              label: fluent.$t("label-display-options-stitch-symbols-on-contrast-background"),
              type: "checkbox",
              checked: paletteDisplaySettings.value.stitchSymbolsOnContrastBackground,
              disabled: paletteDisplaySettings.value.colorOnly,
              onSelect: (event) => {
                event.preventDefault();
                paletteDisplaySettings.value = {
                  ...paletteDisplaySettings.value,
                  stitchSymbolsOnContrastBackground: !paletteDisplaySettings.value.stitchSymbolsOnContrastBackground,
                };
              },
            },
          ],
          [
            {
              label: fluent.$t("label-display-options-show-brand"),
              type: "checkbox",
              checked: paletteDisplaySettings.value.showColorBrands,
              disabled: paletteDisplaySettings.value.colorOnly,
              onSelect: (event) => {
                event.preventDefault();
                paletteDisplaySettings.value = {
                  ...paletteDisplaySettings.value,
                  showColorBrands: !paletteDisplaySettings.value.showColorBrands,
                };
              },
            },
            {
              label: fluent.$t("label-display-options-show-number"),
              type: "checkbox",
              checked: paletteDisplaySettings.value.showColorNumbers,
              disabled: paletteDisplaySettings.value.colorOnly,
              onSelect: (event) => {
                event.preventDefault();
                paletteDisplaySettings.value = {
                  ...paletteDisplaySettings.value,
                  showColorNumbers: !paletteDisplaySettings.value.showColorNumbers,
                };
              },
            },
            {
              label: fluent.$t("label-display-options-show-name"),
              type: "checkbox",
              checked: paletteDisplaySettings.value.showColorNames,
              disabled: paletteDisplaySettings.value.colorOnly,
              onSelect: (event) => {
                event.preventDefault();
                paletteDisplaySettings.value = {
                  ...paletteDisplaySettings.value,
                  showColorNames: !paletteDisplaySettings.value.showColorNames,
                };
              },
            },
          ],
        ],
      },
    ],
  ]);
  const paletteEditingContextMenuOptions = computed<ContextMenuItem[][]>(() => [
    palettePanelsMenuOptions.value,
    [
      {
        label: fluent.$t("label-palette-sort-by"),
        disabled: !patternsStore.pattern?.palette.length,
        children: [
          {
            label: fluent.$t("label-palette-sort-by-brand-and-number"),
            onSelect: () => patternsStore.sortPaletteBy(SortPaletteBy.BrandAndNumber),
          },
        ],
      },
    ],
    [
      {
        label: fluent.$t("label-palette-delete-selected", {
          selected: appStateStore.selectedPaletteItemIndexes.length,
        }),
        disabled: !patternsStore.pattern?.palette.length || !appStateStore.selectedPaletteItemIndexes.length,
        onSelect: () => patternsStore.removePaletteItem(...appStateStore.selectedPaletteItemIndexes),
      },
    ],
    [
      {
        label: fluent.$t("label-palette-select-all"),
        disabled: !patternsStore.pattern?.palette.length,
        onSelect: (event) => {
          event.preventDefault();
          appStateStore.selectedPaletteItemIndexes = patternsStore.pattern!.palette.items.map((_, i) => i);
        },
      },
    ],
    [{ label: fluent.$t("label-save-changes"), onSelect: () => (paletteIsBeingEdited.value = false) }],
  ]);

  const palettePanelsMenuOptions = computed<DropdownMenuItem[]>(() => [
    {
      label: fluent.$t("label-palette-colors"),
      onSelect: () => {
        paletteIsBeingEdited.value = true;
        showPaletteCatalog.value = !showPaletteCatalog.value;
      },
    },
    {
      label: fluent.$t("label-palette-display-options"),
      onSelect: () => {
        paletteIsBeingEdited.value = true;
        showPaletteDisplaySettings.value = !showPaletteDisplaySettings.value;
      },
    },
  ]);

  watch(paletteIsBeingEdited, async (value) => {
    patternsStore.blocked = value;
    if (!value) {
      showPaletteCatalog.value = false;
      showPaletteDisplaySettings.value = false;
      handlePaletteItemsSelection(appStateStore.selectedPaletteItemIndexes);
      await updatePaletteDisplaySettings();
    }
  });

  function handlePaletteItemsSelection(value: number | number[]) {
    const palindexes = Array.isArray(value) ? value : [value];
    if (palindexes.length > 1 && !paletteIsBeingEdited.value) {
      appStateStore.selectedPaletteItemIndexes = palindexes.slice(-1);
    } else appStateStore.selectedPaletteItemIndexes = palindexes;
  }

  function getPaletteItemSymbolFontFamily(palitem: PaletteItem) {
    const defaultSymbolFont = patternsStore.pattern?.defaultSymbolFont;
    if (defaultSymbolFont) {
      return palitem.symbolFont
        ? Array.from(new Set([palitem.symbolFont, defaultSymbolFont]))
            .map((f) => `"${f}"`)
            .join(", ")
        : defaultSymbolFont;
    } else return `"${palitem.symbolFont}"`;
  }

  async function updatePaletteDisplaySettings() {
    await patternsStore.updatePaletteDisplaySettings(paletteDisplaySettings.value);
  }
</script>
