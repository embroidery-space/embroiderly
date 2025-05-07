<template>
  <div
    v-shortcuts.escape="() => (paletteIsBeingEdited = false)"
    class="h-full flex"
    :class="{ 'border-primary border-2': paletteIsBeingEdited }"
  >
    <PaletteList
      :model-value="appStateStore.selectedPaletteItemIndexes"
      :options="patternsStore.pattern?.palette"
      :option-value="(pi) => patternsStore.pattern?.palette.findIndex((cmp) => dequal(cmp, pi))"
      :display-settings="paletteDisplaySettings"
      :disabled="paletteIsDisabled"
      :meta-key-selection="paletteIsBeingEdited"
      fluid-options
      mulitple
      class="grow border-0 rounded-none"
      :class="{ 'border-r': paletteIsBeingEdited }"
      :style="{ backgroundColor: dt('content.background') }"
      :list-style="`border-top: 1px solid ${dt('content.border.color')}; border-bottom: 1px solid ${dt('content.border.color')}`"
      @update:model-value="handlePaletteItemsSelection"
      @contextmenu="(e: PointerEvent) => paletteContextMenu!.show(e)"
    >
      <template #header>
        <div v-if="paletteIsBeingEdited" class="h-9 flex gap-x-1" @contextmenu.stop.prevent>
          <Button
            fluid
            size="small"
            icon="i-prime:check"
            :label="$t('label-save-changes')"
            class="text-nowrap"
            @click="paletteIsBeingEdited = false"
          />
          <Button size="small" icon="i-prime:bars" @click="(e) => PaletteSectionsMenu!.toggle(e)" />
        </div>
        <div v-else class="flex gap-x-2" @contextmenu.stop.prevent>
          <ToolSelector
            v-model="appStateStore.selectedStitchTool"
            :options="fullstitches"
            :use-palitem-color="preferencesStore.usePaletteItemColorForStitchTools"
            :disabled="paletteIsDisabled"
          />
          <ToolSelector
            v-model="appStateStore.selectedStitchTool"
            :options="partstitches"
            :use-palitem-color="preferencesStore.usePaletteItemColorForStitchTools"
            :disabled="paletteIsDisabled"
          />
          <ToolSelector
            v-model="appStateStore.selectedStitchTool"
            :options="linestitches"
            :use-palitem-color="preferencesStore.usePaletteItemColorForStitchTools"
            :disabled="paletteIsDisabled"
          />
          <ToolSelector
            v-model="appStateStore.selectedStitchTool"
            :options="nodestitches"
            :use-palitem-color="preferencesStore.usePaletteItemColorForStitchTools"
            :disabled="paletteIsDisabled"
          />
        </div>
      </template>

      <template #footer>
        <div class="flex items-center justify-between" @contextmenu.stop.prevent>
          <span class="text-nowrap">{{
            $t("label-palette-size", { size: patternsStore.pattern?.palette.length ?? 0 })
          }}</span>
          <Button
            v-tooltip="{
              value: paletteIsBeingEdited ? $t('label-save-changes') : $t('label-palette-edit'),
              showDelay: 200,
            }"
            text
            rounded
            :disabled="paletteIsDisabled"
            :icon="paletteIsBeingEdited ? 'i-prime:check' : 'i-prime:pencil'"
            size="small"
            severity="secondary"
            @click="
              () => {
                paletteIsBeingEdited = !paletteIsBeingEdited;
                showPaletteCatalog = true;
              }
            "
            @contextmenu="
              (e) => {
                if (!paletteIsBeingEdited) PaletteSectionsMenu!.show(e);
              }
            "
          />
        </div>
      </template>
    </PaletteList>
    <ContextMenu
      ref="palette-context-menu"
      :model="paletteIsBeingEdited ? paletteEditingContextMenuOptions : paletteContextMenuOptions"
    />
    <Menu ref="palette-panels-menu" popup :model="PaletteSectionsMenuOptions" />

    <PaletteCatalog
      v-if="patternsStore.pattern?.palette && showPaletteCatalog"
      :palette="patternsStore.pattern.palette"
      class="border-content min-w-max border-r"
      @close="showPaletteCatalog = false"
      @add-palette-item="patternsStore.addPaletteItem"
      @remove-palette-item="patternsStore.removePaletteItem"
    />

    <PaletteDisplaySettings
      v-if="showPaletteDisplaySettings"
      :settings="paletteDisplaySettings"
      @update:settings="(value) => (paletteDisplaySettings = value)"
      @close="showPaletteDisplaySettings = false"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, defineAsyncComponent, nextTick, ref, useTemplateRef, watch } from "vue";
  import { useFluent } from "fluent-vue";
  import { dt } from "@primeuix/themes";
  import { Button, ContextMenu, Menu } from "primevue";
  import type { MenuItem } from "primevue/menuitem";
  import { dequal } from "dequal";
  import { usePatternsStore } from "#/stores/patterns";
  import { useAppStateStore } from "#/stores/state";
  import { usePreferencesStore } from "#/stores/preferences";
  import { FullStitchKind, LineStitchKind, NodeStitchKind, PaletteSettings, PartStitchKind } from "#/schemas/index.ts";
  import PaletteList from "./palette/PaletteList.vue";
  import ToolSelector from "./toolbar/ToolSelector.vue";

  const PaletteCatalog = defineAsyncComponent(() => import("./palette/PaletteCatalog.vue"));
  const PaletteDisplaySettings = defineAsyncComponent(() => import("./palette/PaletteDisplaySettings.vue"));

  const appStateStore = useAppStateStore();
  const preferencesStore = usePreferencesStore();
  const patternsStore = usePatternsStore();

  const fluent = useFluent();

  const fullstitches = ref([
    { icon: "i-stitches:full", label: () => fluent.$t("label-stitch-full"), value: FullStitchKind.Full },
    { icon: "i-stitches:petite", label: () => fluent.$t("label-stitch-petite"), value: FullStitchKind.Petite },
  ]);
  const partstitches = ref([
    { icon: "i-stitches:half", label: () => fluent.$t("label-stitch-half"), value: PartStitchKind.Half },
    { icon: "i-stitches:quarter", label: () => fluent.$t("label-stitch-quarter"), value: PartStitchKind.Quarter },
  ]);
  const linestitches = ref([
    { icon: "i-stitches:back", label: () => fluent.$t("label-stitch-back"), value: LineStitchKind.Back },
    { icon: "i-stitches:straight", label: () => fluent.$t("label-stitch-straight"), value: LineStitchKind.Straight },
  ]);
  const nodestitches = ref([
    { icon: "i-stitches:french-knot", label: () => fluent.$t("label-stitch-french-knot"), value: NodeStitchKind.FrenchKnot }, // prettier-ignore
    { icon: "i-stitches:bead", label: () => fluent.$t("label-stitch-bead"), value: NodeStitchKind.Bead },
  ]);

  const paletteIsDisabled = computed(() => !patternsStore.pattern);
  const paletteIsBeingEdited = ref(false);

  const showPaletteCatalog = ref(false);
  const showPaletteDisplaySettings = ref(false);

  let paletteDisplaySettingsHaveChanged = false;
  const paletteDisplaySettings = computed({
    get: () => patternsStore.pattern?.paletteDisplaySettings ?? PaletteSettings.default(),
    set: (value: PaletteSettings) => {
      paletteDisplaySettingsHaveChanged = true;
      patternsStore.updatePaletteDisplaySettings(value, true);
    },
  });

  const PaletteSectionsMenu = useTemplateRef("palette-panels-menu");
  const PaletteSectionsMenuOptions = computed<MenuItem[]>(() => [
    {
      label: fluent.$t("label-palette-colors"),
      command: () => {
        paletteIsBeingEdited.value = true;
        showPaletteCatalog.value = !showPaletteCatalog.value;
      },
    },
    {
      label: fluent.$t("label-palette-display-options"),
      command: () => {
        paletteIsBeingEdited.value = true;
        showPaletteDisplaySettings.value = !showPaletteDisplaySettings.value;
      },
    },
  ]);

  const paletteContextMenu = useTemplateRef("palette-context-menu");
  const paletteContextMenuOptions = computed<MenuItem[]>(() => [
    {
      label: fluent.$t("label-palette-edit"),
      command: ({ originalEvent }) => {
        paletteIsBeingEdited.value = true;
        nextTick(() => paletteContextMenu.value!.show(originalEvent));
      },
    },
  ]);
  const paletteEditingContextMenuOptions = computed<MenuItem[]>(() => [
    ...PaletteSectionsMenuOptions.value,
    { separator: true },
    {
      label: fluent.$t("label-palette-delete-selected", { selected: appStateStore.selectedPaletteItemIndexes.length }),
      disabled: !patternsStore.pattern?.palette.length || !appStateStore.selectedPaletteItemIndexes.length,
      command: () => patternsStore.removePaletteItem(...appStateStore.selectedPaletteItemIndexes),
    },
    { separator: true },
    {
      label: fluent.$t("label-palette-select-all"),
      disabled: !patternsStore.pattern?.palette.length,
      command: ({ originalEvent }) => {
        appStateStore.selectedPaletteItemIndexes = patternsStore.pattern!.palette.map((_, i) => i);
        nextTick(() => paletteContextMenu.value!.show(originalEvent));
      },
    },
    { separator: true },
    { label: fluent.$t("label-save-changes"), command: () => (paletteIsBeingEdited.value = false) },
  ]);

  watch(paletteIsBeingEdited, (value) => {
    patternsStore.blocked = value;
    if (!value) {
      showPaletteCatalog.value = false;
      if (paletteDisplaySettingsHaveChanged) {
        patternsStore.updatePaletteDisplaySettings(paletteDisplaySettings.value);
        paletteDisplaySettingsHaveChanged = false;
      }
      showPaletteDisplaySettings.value = false;
      handlePaletteItemsSelection(appStateStore.selectedPaletteItemIndexes);
    }
  });

  function handlePaletteItemsSelection(palindexes: number[]) {
    if (palindexes.length > 1 && !paletteIsBeingEdited.value) {
      appStateStore.selectedPaletteItemIndexes = palindexes.slice(-1);
    } else appStateStore.selectedPaletteItemIndexes = palindexes;
  }
</script>
