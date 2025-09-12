<template>
  <div
    v-shortcuts.escape="() => (paletteIsBeingEdited = false)"
    class="flex h-full"
    :class="{ 'border-2 border-primary': paletteIsBeingEdited }"
  >
    <UContextMenu :items="paletteIsBeingEdited ? paletteEditingContextMenuOptions : paletteContextMenuOptions">
      <PaletteList
        :model-value="appStateStore.selectedPaletteItemIndexes"
        :options="patternsStore.pattern?.palette"
        :option-value="(pi) => patternsStore.pattern?.palette.findIndex((cmp) => dequal(cmp, pi))"
        :display-settings="paletteDisplaySettings"
        :disabled="paletteIsDisabled"
        multiple
        class="grow"
        @update:model-value="handlePaletteItemsSelection"
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
      :palette="patternsStore.pattern.palette"
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
  import { computed, ref, watch } from "vue";
  import type { DropdownMenuItem } from "@nuxt/ui";
  import { dequal } from "dequal";
  import { PaletteSettings } from "~/core/pattern/";

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();

  const fluent = useFluent();

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

  const paletteContextMenuOptions = computed<DropdownMenuItem[]>(() => [
    {
      label: fluent.$t("label-palette-edit"),
      onSelect: (event) => {
        event.preventDefault();
        paletteIsBeingEdited.value = true;
      },
    },
  ]);
  const paletteEditingContextMenuOptions = computed<DropdownMenuItem[][]>(() => [
    palettePanelsMenuOptions.value,
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
          appStateStore.selectedPaletteItemIndexes = patternsStore.pattern!.palette.map((_, i) => i);
        },
      },
    ],
    [{ label: fluent.$t("label-save-changes"), onSelect: () => (paletteIsBeingEdited.value = false) }],
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
