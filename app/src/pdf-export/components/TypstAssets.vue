<script setup lang="ts">
import { ButtonIcon, Tree, useConfirm } from "@embroiderly/ui";
import type { TreeItem } from "@embroiderly/ui";

import { computed } from "vue";

import { IconPlus, IconTrash } from "~/assets/icons/";
import { useFilePicker, useI18n } from "~/composables/";
import { PdfAsset } from "~/lib/pattern/";

const { fonts } = defineProps<{ fonts: PdfAsset[] }>();
const emit = defineEmits<{
  addFonts: [fonts: PdfAsset[]];
  removeFont: [index: number];
}>();

const confirm = useConfirm();
const filePicker = useFilePicker();
const { fluent } = useI18n();

const fontItems = computed<TreeItem[]>(() => [
  {
    label: fluent.$t("pdf-export-assets-fonts"),
    children: fonts.map((f) => ({ label: f.fileName })),
    defaultExpanded: true,
    nested: true,
  },
]);

async function addFonts() {
  const handles = await filePicker.open({
    types: filePicker.filters.font,
    id: filePicker.ids.font,
    multiple: true,
  });
  if (!handles) return;

  const fonts = await Promise.all(
    handles.map(async (handle) => {
      const fileName = handle.name;
      const content = await handle.getFile().then((f) => f.bytes());
      return new PdfAsset({ fileName, content });
    }),
  );

  emit("addFonts", fonts);
}

async function removeFont(index: number, fileName: string) {
  const accepted = await confirm.open(fluent.$t("pdf-export-assets-file-removal", { fileName })).result;
  if (accepted) emit("removeFont", index);
}
</script>

<template>
  <Tree :items="fontItems" scroll :class="$style.tree">
    <template #item-trailing="{ item, level, index }">
      <ButtonIcon
        v-if="level === 1"
        square
        color="neutral"
        variant="ghost"
        size="sm"
        :icon="IconPlus"
        :tooltip="$t('pdf-export-assets-add-fonts')"
        @click.stop="addFonts"
      />
      <ButtonIcon
        v-else
        square
        color="neutral"
        variant="ghost"
        size="sm"
        :icon="IconTrash"
        :tooltip="$t('pdf-export-assets-remove-file')"
        @click.stop="removeFont(index, item.label)"
      />
    </template>
  </Tree>
</template>

<style module>
/*
  Disable hover and active states.
  The tree isn't interactive in the regular sense.
*/
.tree [data-slot="item"] {
  cursor: default;

  &:focus-visible {
    outline: none;
  }

  &[aria-selected="true"] {
    background: none;
  }

  &[data-ancestor-selected] {
    background: none;
  }

  &:hover {
    background: none;
  }
}
</style>
