<script setup lang="ts">
import {
  Button,
  ButtonIcon,
  ContextMenu,
  DropdownMenu,
  SplitterPanel,
  useForwardPropsEmits,
  useToast,
} from "@embroiderly/ui";
import type { ContextMenuItem, DropdownMenuItem, SplitterPanelProps, SplitterPanelEmits } from "@embroiderly/ui";

import { computed, reactive, ref, useTemplateRef, watch } from "vue";

import { IconCheck, IconMenu, IconPalette } from "~/assets/icons/";
import { PaletteCatalog, PaletteDisplaySettings, PaletteList, PaletteListItem } from "~/components/palette/";
import { StitchSymbols } from "~/components/symbols/";
import { useI18n } from "~/composables/";
import { PaletteItem, PaletteSettings, SortPaletteBy, Symbol } from "~/lib/pattern/";
import { PaletteMode, useEditorStateStore, usePatternStore } from "~/stores/";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WorkspacePalettePanelProps extends SplitterPanelProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WorkspacePalettePanelEmits extends SplitterPanelEmits {}

const props = defineProps<WorkspacePalettePanelProps>();
const emits = defineEmits<WorkspacePalettePanelEmits>();

const splitterPanelProps = useForwardPropsEmits(props, emits);

const editorStateStore = useEditorStateStore();
const patternStore = usePatternStore();

const { fluent } = useI18n();
const toast = useToast();

const panel = useTemplateRef("panel");

const collapsed = ref(false);
const disabled = computed(() => patternStore.pattern.isNil);
const paletteIsEmpty = computed(() => patternStore.pattern.palette.length === 0);

const sectionVisibility = reactive({
  paletteDisplaySettings: false,
  paletteCatalog: false,
  stitchSymbols: false,
});

const paletteDisplaySettings = ref(new PaletteSettings());
const effectiveDisplaySettings = computed(() => {
  if (collapsed.value) return { ...paletteDisplaySettings.value, columnsNumber: 1, colorOnly: true };
  return paletteDisplaySettings.value;
});
watch(
  () => patternStore.pattern.paletteDisplaySettings,
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
        onSelect() {
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
                  paletteDisplaySettings.value = new PaletteSettings({
                    ...paletteDisplaySettings.value,
                    columnsNumber: n,
                  });
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
                paletteDisplaySettings.value = new PaletteSettings({
                  ...paletteDisplaySettings.value,
                  colorOnly: !colorOnly,
                });
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
                paletteDisplaySettings.value = new PaletteSettings({
                  ...paletteDisplaySettings.value,
                  showStitchSymbols: !showStitchSymbols,
                });
              },
            },
            {
              label: fluent.$t("palette-contrast-stitch-symbols"),
              type: "checkbox",
              checked: stitchSymbolsOnContrastBackground,
              disabled: colorOnly,
              onSelect: (event) => {
                event.preventDefault();
                paletteDisplaySettings.value = new PaletteSettings({
                  ...paletteDisplaySettings.value,
                  stitchSymbolsOnContrastBackground: !stitchSymbolsOnContrastBackground,
                });
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
                paletteDisplaySettings.value = new PaletteSettings({
                  ...paletteDisplaySettings.value,
                  showColorBrands: !showColorBrands,
                });
              },
            },
            {
              label: fluent.$t("palette-show-number"),
              type: "checkbox",
              checked: showColorNumbers,
              disabled: colorOnly,
              onSelect: (event) => {
                event.preventDefault();
                paletteDisplaySettings.value = new PaletteSettings({
                  ...paletteDisplaySettings.value,
                  showColorNumbers: !showColorNumbers,
                });
              },
            },
            {
              label: fluent.$t("palette-show-name"),
              type: "checkbox",
              checked: showColorNames,
              disabled: colorOnly,
              onSelect: (event) => {
                event.preventDefault();
                paletteDisplaySettings.value = new PaletteSettings({
                  ...paletteDisplaySettings.value,
                  showColorNames: !showColorNames,
                });
              },
            },
          ],
        ],
      },
    ],
  ];
});
const paletteEditingContextMenuOptions = computed<ContextMenuItem[][]>(() => {
  const palsize = patternStore.pattern.palette.length ?? 0;
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
            handleRemovePaletteItem(editorStateStore.selectedPaletteItemIndex);
          }
        },
      },
      {
        label: fluent.$t("palette-ctx-menu-delete-all"),
        disabled: !palsize,
        onSelect: () => {
          if (palsize) {
            handleRemovePaletteItem(...Array.from({ length: palsize }).keys());
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

watch(
  () => editorStateStore.paletteMode,
  async (value) => {
    if (value === PaletteMode.Regular) {
      sectionVisibility.paletteDisplaySettings = false;
      sectionVisibility.paletteCatalog = false;
      sectionVisibility.stitchSymbols = false;
      await updatePaletteDisplaySettings();

      // Restore collapsed state when exiting editing mode.
      if (editorStateStore.palettePanelCollapsed) panel.value?.collapse();
    } else {
      // Forcibly expand the panel and open the palette catalog when entering editing mode.
      panel.value?.expand();
      sectionVisibility.paletteCatalog = true;
    }
  },
);

watch(
  () => editorStateStore.palettePanelCollapsed,
  (collapsed) => {
    if (collapsed) panel.value?.collapse();
    else panel.value?.expand();
  },
);

function handlePanelCollapse() {
  collapsed.value = true;
  if (editorStateStore.paletteMode !== PaletteMode.Editing) {
    editorStateStore.palettePanelCollapsed = true;
  }
}

function handlePanelExpand() {
  collapsed.value = false;
  if (editorStateStore.paletteMode !== PaletteMode.Editing) {
    editorStateStore.palettePanelCollapsed = false;
  }
}

function handleSetSymbol({ fontFamily, codePoint }: { fontFamily: string; codePoint: number }) {
  if (editorStateStore.selectedPaletteItemIndex === undefined) {
    toast.add({ title: fluent.$t("stitch-symbols-no-palitem-selected"), color: "warning" });
    return;
  }

  // Check if this symbol is already assigned to another palette item.
  const existingItem = patternStore.pattern.palette.items.find(
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
  const paletteItem = patternStore.pattern.palette.items.find(
    (pi) => pi.symbol?.font === fontFamily && pi.symbol?.code === codePoint,
  );
  if (!paletteItem) return;

  patternStore.setPaletteItemSymbol(paletteItem.index, undefined);
}

async function handleAddPaletteItem(palitem: PaletteItem) {
  await patternStore.addPaletteItem(palitem);

  if (editorStateStore.selectedPaletteItemIndex !== undefined) return;

  const insertedIndex = patternStore.pattern.palette.items.findIndex(
    (pi) => pi.brand === palitem.brand && pi.number === palitem.number,
  );
  if (insertedIndex !== -1) editorStateStore.selectedPaletteItemIndex = insertedIndex;
}

async function handleRemovePaletteItem(...indexes: number[]) {
  await patternStore.removePaletteItem(...indexes);

  const selected = editorStateStore.selectedPaletteItemIndex;
  if (selected !== undefined) {
    if (indexes.includes(selected)) {
      // Jump to the new first or last item if the selected one is removed.
      const newLength = patternStore.pattern.palette.items.length - indexes.length;
      editorStateStore.selectedPaletteItemIndex =
        newLength <= 0 ? undefined : Math.min(selected - indexes.filter((i) => i < selected).length, newLength - 1);
    } else {
      // Adjust the selected index if items before it are removed.
      const removedBefore = indexes.reduce((n, i) => n + (i < selected ? 1 : 0), 0);
      if (removedBefore > 0) editorStateStore.selectedPaletteItemIndex = selected - removedBefore;
    }
  }
}

async function updatePaletteDisplaySettings() {
  if (paletteDisplaySettings.value.equals(patternStore.pattern.paletteDisplaySettings)) return;
  await patternStore.updatePaletteDisplaySettings(paletteDisplaySettings.value);
}
</script>

<template>
  <SplitterPanel
    ref="panel"
    v-bind="splitterPanelProps"
    tabindex="-1"
    class="flex h-full outline-none"
    :class="{ 'border-2 border-primary': editorStateStore.paletteMode === PaletteMode.Editing }"
    :style="{ overflow: collapsed ? undefined : 'visible clip' }"
    @keydown.escape="editorStateStore.paletteMode = PaletteMode.Regular"
    @collapse="handlePanelCollapse"
    @expand="handlePanelExpand"
    @resize="editorStateStore.palettePanelSize = $event"
  >
    <ContextMenu
      :disabled="disabled"
      :items="
        editorStateStore.paletteMode === PaletteMode.Editing
          ? paletteEditingContextMenuOptions
          : paletteContextMenuOptions
      "
      @update:open="(isOpen) => !isOpen && updatePaletteDisplaySettings()"
    >
      <PaletteList
        v-model="editorStateStore.selectedPaletteItemIndex"
        :options="patternStore.pattern.palette.itemsInVisualOrder"
        :option-value="(pi) => patternStore.pattern.palette.items.indexOf(pi)"
        :display-settings="effectiveDisplaySettings"
        :disabled="disabled"
        :draggable="editorStateStore.paletteMode === PaletteMode.Editing"
        :scroll="{ type: 'hover', size: 'sm' }"
        selection-behavior="replace"
        class="grow"
        @reorder="({ oldPosition, newPosition }) => patternStore.reorderPaletteItems(oldPosition, newPosition)"
      >
        <template #header>
          <div
            v-if="editorStateStore.paletteMode === PaletteMode.Editing"
            class="flex gap-x-1"
            @contextmenu.stop.prevent
          >
            <Button
              data-tour="palette-save"
              :icon="IconCheck"
              :label="$t('palette-save')"
              class="grow justify-center text-sm"
              @click="editorStateStore.paletteMode = PaletteMode.Regular"
            />
            <DropdownMenu :items="palettePanelsMenuOptions" :content="{ align: 'end' }">
              <Button :icon="IconMenu" :aria-label="$t('palette-panel-menu')" />
            </DropdownMenu>
          </div>
          <div
            v-else
            class="flex items-center"
            :class="collapsed ? 'justify-center' : 'justify-between'"
            @contextmenu.stop.prevent
          >
            <span v-show="!collapsed" class="text-sm text-nowrap">
              {{ $t("palette-size", { size: patternStore.pattern.palette.length ?? 0 }) }}
            </span>

            <ButtonIcon
              data-tour="palette-edit"
              variant="ghost"
              color="neutral"
              :disabled="disabled"
              :icon="IconPalette"
              :tooltip="$t('palette-edit')"
              :delay-duration="200"
              :ui="{ leadingIcon: paletteIsEmpty && !disabled ? 'animate-rainbow-shine' : undefined }"
              @click="
                () => {
                  editorStateStore.paletteMode =
                    editorStateStore.paletteMode === PaletteMode.Editing ? PaletteMode.Regular : PaletteMode.Editing;
                }
              "
            />
          </div>
        </template>

        <template #option="{ option: paletteItem, selected, displaySettings }">
          <PaletteListItem
            :palette-item="paletteItem"
            :selected="selected"
            :display-settings="displaySettings"
            :class="{ 'justify-center': collapsed }"
          >
            <template v-if="collapsed || (!displaySettings.colorOnly && displaySettings.showStitchSymbols)">
              <span
                v-if="paletteItem.symbol"
                class="inline-flex size-4 shrink-0 items-center justify-center"
                :class="{
                  'rounded-sm bg-white text-black': displaySettings.stitchSymbolsOnContrastBackground,
                }"
                :style="{ fontFamily: paletteItem.symbol.font }"
              >
                {{ paletteItem.symbol.char }}
              </span>
              <!-- If the palete item doesn't have a stitch symbol, render an empty `span`, so that the title is properly aligned with those with symbols. -->
              <span v-else class="size-4 shrink-0"></span>
            </template>
          </PaletteListItem>
        </template>
      </PaletteList>
    </ContextMenu>

    <PaletteDisplaySettings
      v-if="sectionVisibility.paletteDisplaySettings"
      v-model:settings="paletteDisplaySettings"
      class="border-l border-default"
      @close="sectionVisibility.paletteDisplaySettings = false"
    />

    <PaletteCatalog
      v-if="patternStore.pattern.palette && sectionVisibility.paletteCatalog"
      data-tour="add-color"
      :palette="patternStore.pattern.palette.items"
      class="min-w-max border-l border-default"
      @close="sectionVisibility.paletteCatalog = false"
      @add-palette-item="handleAddPaletteItem"
      @remove-palette-item="handleRemovePaletteItem"
    />

    <StitchSymbols
      v-if="patternStore.pattern.palette && sectionVisibility.stitchSymbols"
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
  </SplitterPanel>
</template>
