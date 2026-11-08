<script setup lang="ts">
import { ButtonIcon, Tree, useConfirm } from "@embroiderly/ui";
import type { TreeItem } from "@embroiderly/ui";

import { computed, h } from "vue";
import type { Component } from "vue";

import { IconPlus, IconTrash } from "~/assets/icons/";
import { useFilePicker, useI18n } from "~/composables/";
import { PdfAsset } from "~/lib/pattern/";

import AsideBlock from "./utils/AsideBlock.vue";

interface AssetTreeItem extends TreeItem {
  children?: AssetTreeItem[];
  trailingButton: Component;
}

const { files, fonts } = defineProps<{ files: PdfAsset[]; fonts: PdfAsset[] }>();
const emit = defineEmits<{
  addFiles: [files: PdfAsset[]];
  removeFile: [index: number, fileNmae: string];

  addFonts: [fonts: PdfAsset[]];
  removeFont: [index: number, fileNmae: string];
}>();

const confirm = useConfirm();
const filePicker = useFilePicker();
const { fluent } = useI18n();

const fontItems = computed<AssetTreeItem[]>(() => [
  {
    label: fluent.$t("pdf-export-assets-fonts"),
    children: fonts.map((item, index) => ({
      label: item.fileName,
      trailingButton: h(ButtonIcon, {
        square: true,
        color: "neutral",
        variant: "ghost",
        size: "sm",
        icon: IconTrash,
        tooltip: fluent.$t("pdf-export-assets-remove-file"),
        async onClick(e) {
          e.stopPropagation();
          await removeFont(index, item.fileName);
        },
      }),
    })),
    trailingButton: h(ButtonIcon, {
      square: true,
      color: "neutral",
      variant: "ghost",
      size: "sm",
      icon: IconPlus,
      tooltip: fluent.$t("pdf-export-assets-add-files"),
      async onClick(e) {
        e.stopPropagation();
        await addFonts();
      },
    }),
    defaultExpanded: true,
    nested: true,
  },
  {
    label: fluent.$t("pdf-export-assets-files"),
    children: files.map((item, index) => ({
      label: item.fileName,
      trailingButton: h(ButtonIcon, {
        square: true,
        color: "neutral",
        variant: "ghost",
        size: "sm",
        icon: IconTrash,
        tooltip: fluent.$t("pdf-export-assets-remove-file"),
        async onClick(e) {
          e.stopPropagation();
          await removeFile(index, item.fileName);
        },
      }),
    })),
    trailingButton: h(ButtonIcon, {
      square: true,
      color: "neutral",
      variant: "ghost",
      size: "sm",
      icon: IconPlus,
      tooltip: fluent.$t("pdf-export-assets-add-files"),
      async onClick(e) {
        e.stopPropagation();
        await addFiles();
      },
    }),
    defaultExpanded: true,
    nested: true,
  },
]);

async function addFiles() {
  const handles = await filePicker.open({
    id: filePicker.ids.other,
    multiple: true,
  });
  if (!handles) return;

  const files = await Promise.all(
    handles.map(async (handle) => {
      const fileName = handle.name;
      const content = await handle.getFile().then((f) => f.bytes());
      return new PdfAsset({ fileName, content });
    }),
  );

  emit("addFiles", files);
}

async function removeFile(index: number, fileName: string) {
  const accepted = await confirm.open(fluent.$t("pdf-export-assets-file-removal", { fileName })).result;
  if (accepted) emit("removeFile", index, fileName);
}

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
  if (accepted) emit("removeFont", index, fileName);
}
</script>

<template>
  <AsideBlock :title="$t('pdf-export-assets')">
    <Tree :items="fontItems" scroll :class="$style.tree">
      <template #item-trailing="{ item }">
        <Component :is="item.trailingButton" />
      </template>
    </Tree>
  </AsideBlock>
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
