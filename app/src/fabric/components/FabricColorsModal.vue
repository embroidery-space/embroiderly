<script setup lang="ts">
import { Button, ButtonIcon, Dialog, Input, InputColor, useConfirm, useShortcuts, useToast } from "@embroiderly/ui";

import { useManualRefHistory } from "@vueuse/core";
import { insertNodeAt, removeNode, useSortable } from "@vueuse/integrations/useSortable";
import { isEqual } from "es-toolkit";
import { useFluent } from "fluent-vue";
import { v4 as uuidv4 } from "uuid";
import { computed, nextTick, ref, toRaw, useTemplateRef, watch } from "vue";

import { IconDragHandle, IconPlus, IconTrash } from "~/assets/icons/";
import { useEditor } from "~/composables/";
import { serializeFabricColors } from "~/lib/pattern/";
import type { FabricColor } from "~/lib/pattern/";

interface WorkingFabricColor {
  /** A stable ID for `v-for`. */
  id: string;

  name: string;
  color: string;
}

// Owned explicitly to hande every way to the modal.
const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{ colors: FabricColor[] }>();

const confirm = useConfirm();
const toast = useToast();
const fluent = useFluent();
const { files } = useEditor();

const working = ref<WorkingFabricColor[]>(
  props.colors.map((color) => ({ id: uuidv4(), name: color.name, color: color.hex.slice(1) })),
);
const original = ref<WorkingFabricColor[]>(working.value.map((row) => ({ ...row })));
const isDirty = computed(() => !isEqual(working.value, original.value));

const history = useManualRefHistory(working, { clone: true });

let forceClosing = false;
watch(open, async (value) => {
  if (value || forceClosing || !isDirty.value) return;

  open.value = true; // Reka UI flips this to `false` on its own; revert immediately.

  const accepted = await confirm.open(fluent.$ta("fabric-colors-discard-confirm")).result;
  if (!accepted) return;

  forceClosing = true;
  open.value = false;
});

const dialogRef = useTemplateRef<InstanceType<typeof Dialog>>("dialog");
const rowsRef = useTemplateRef<HTMLElement>("rows");

useShortcuts(
  {
    "Control+Z": () => history.undo(),
    "Control+Y": () => history.redo(),
  },
  { target: () => dialogRef.value?.contentRef?.$el ?? null },
);

useSortable(rowsRef, [], {
  animation: 100,
  forceFallback: true, // Use custom implementation instead of built-in HTML5 features.
  watchElement: true, // Watch for the the provided element, as it is rendered conditionally, so its ref isn't resolved on setup.
  handle: "[data-drag-handle]", // Only start a drag from the handle, not from inside the inputs.
  onUpdate: ({ from, item, oldIndex, newIndex }) => {
    if (oldIndex === undefined || newIndex === undefined) return;

    // Restore the original DOM positions so Vue can properly re-render the list.
    removeNode(item);
    insertNodeAt(from, item, oldIndex);

    nextTick(() => {
      const [moved] = working.value.splice(oldIndex, 1);
      working.value.splice(newIndex, 0, moved!);
      history.commit();
    });
  },
});

// A name is invalid when it is empty or shared with another row.
const invalidIds = computed(() => {
  const invalid = new Set<string>();

  const counts = new Map<string, number>();
  for (const row of working.value) {
    const key = row.name.trim();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  for (const row of working.value) {
    const key = row.name.trim();
    if (!key || counts.get(key)! > 1) invalid.add(row.id);
  }

  return invalid;
});
const canSave = computed(() => isDirty.value && invalidIds.value.size === 0);

function addColor() {
  working.value.push({ id: uuidv4(), name: fluent.$t("fabric-colors-new-color"), color: "FFFFFF" });
  history.commit();

  nextTick(() => {
    const inputs = rowsRef.value?.querySelectorAll("input");
    inputs?.item(inputs.length - 1)?.focus();
  });
}

function removeColor(id: string) {
  working.value = working.value.filter((row) => row.id !== id);
  history.commit();
}

async function restoreDefaults() {
  const accepted = await confirm.open(fluent.$ta("fabric-colors-restore-confirm")).result;
  if (!accepted) return;

  const defaults = (await (await fetch("/fabric-colors.json")).json()) as { name: string; color: string }[];
  working.value = defaults.map((color) => ({ id: uuidv4(), name: color.name, color: color.color }));
  history.commit();
}

function handleClose() {
  open.value = false; // The watcher above handles the confirmation.
}

async function handleSave() {
  try {
    await files.saveFabricColors(serializeFabricColors(working.value));

    toast.add({ color: "success", title: fluent.$t("fabric-colors-save-success") });

    // Clears `isDirty` so the close below doesn't re-prompt.
    original.value = structuredClone(working.value.map((row) => toRaw(row)));
    open.value = false;
  } catch {
    toast.add({ color: "error", title: fluent.$t("error") });
  }
}
</script>

<template>
  <Dialog ref="dialog" v-model:open="open" :title="$t('fabric-colors')" :dismissible="!isDirty" :class="$style.dialog">
    <template #body>
      <div ref="rows" :class="$style.rows">
        <div v-for="row in working" :key="row.id" :class="$style.row">
          <span data-drag-handle :class="$style.handle">
            <IconDragHandle :class="$style.handleIcon" />
          </span>

          <InputColor
            v-model="row.color"
            :aria-label="$t('fabric-colors-color')"
            @update:model-value="history.commit"
          />

          <Input
            v-model="row.name"
            :aria-label="$t('fabric-colors-name')"
            :aria-invalid="invalidIds.has(row.id)"
            :class="{ [$style.invalid]: invalidIds.has(row.id) }"
            @blur="history.commit"
          />

          <ButtonIcon
            :icon="IconTrash"
            variant="ghost"
            color="neutral"
            :tooltip="$t('fabric-colors-delete')"
            @click="removeColor(row.id)"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <p v-if="invalidIds.size" :class="$style.error">{{ $t("fabric-colors-invalid-names") }}</p>

      <!--
        `flex-wrap` keeps this row's min-content width down to its single widest button. Without
        it, the row's forced width (sum of all five controls) blows out the dialog's implicit
        single grid column below ~480px, since `Dialog.Content` has no `minmax(0, ...)` clamp.
      -->
      <div :class="$style.actions">
        <Button
          variant="outline"
          color="neutral"
          :icon="IconPlus"
          :label="$t('fabric-colors-add')"
          :class="$style.add"
          @click="addColor"
        />
        <Button :label="$t('fabric-colors-restore-default')" color="neutral" variant="link" @click="restoreDefaults" />

        <div :class="$style.confirm">
          <Button :label="$t('modal-cancel')" color="neutral" variant="outline" @click="handleClose" />
          <Button loading-auto :label="$t('modal-save')" :disabled="!canSave" @click="handleSave" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style module>
.dialog[data-slot="content"] {
  width: var(--container-xl);

  > [data-slot="footer"] {
    display: block;
  }
}

.rows {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 1);
}

.row {
  display: grid;
  grid-template-columns: auto 7rem minmax(0, 1fr) auto;
  gap: calc(var(--spacing) * 2);
  align-items: center;
}

.handle {
  cursor: grab;

  color: var(--text-color-muted);
}

.handle-icon {
  width: calc(var(--spacing) * 4);
  height: calc(var(--spacing) * 4);
}

/* `Input` passes the class to its `input`. Outweighs the variants of `Input`. */
input.invalid[data-slot="base"] {
  box-shadow: inset 0 0 0 1px var(--color-error);
}

.error {
  margin-bottom: calc(var(--spacing) * 2);

  font-size: var(--text-sm);
  color: var(--color-error);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 1.5);
  align-items: center;
}

/* Outweighs the radius of `Button`. */
button.add[data-slot="base"] {
  border-style: dashed;
  border-radius: calc(infinity * 1px);
}

.confirm {
  display: flex;
  gap: calc(var(--spacing) * 1.5);
  align-items: center;

  margin-inline-start: auto;
}
</style>
