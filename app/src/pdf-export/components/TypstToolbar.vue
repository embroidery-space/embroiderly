<script setup lang="ts">
import { Button, ButtonIcon, DropdownMenu, Separator } from "@embroiderly/ui";

import {
  IconChevronDown,
  IconFormatH1,
  IconFormatH2,
  IconFormatH3,
  IconFormatH4,
  IconFormatH5,
  IconFormatH6,
  IconFormatBold,
  IconFormatItalic,
  IconFormatUnderlined,
  IconFormatListBulleted,
  IconFormatListNumbered,
  IconFormatLink,
  IconFormatImage,
  IconFormatTable,
} from "~/assets/icons/";

const emit = defineEmits<{
  "toggle-bold-text": [];
  "toggle-italic-text": [];
  "toggle-underlined-text": [];
}>();
</script>

<template>
  <div :class="$style.root">
    <DropdownMenu
      :items="
        [IconFormatH1, IconFormatH2, IconFormatH3, IconFormatH4, IconFormatH5, IconFormatH6].map((icon, index) => ({
          icon,
          label: $t('pdf-export-format-heading-n', { n: index + 1 }),
        }))
      "
    >
      <Button
        variant="ghost"
        color="neutral"
        :icon-trailing="IconChevronDown"
        :label="$t('pdf-export-format-heading')"
      />
    </DropdownMenu>

    <Separator orientation="vertical" />

    <ButtonIcon
      variant="ghost"
      color="neutral"
      :icon="IconFormatBold"
      :tooltip="$t('pdf-export-format-bold')"
      @click="emit('toggle-bold-text')"
    />
    <ButtonIcon
      variant="ghost"
      color="neutral"
      :icon="IconFormatItalic"
      :tooltip="$t('pdf-export-format-italic')"
      @click="emit('toggle-italic-text')"
    />
    <ButtonIcon
      variant="ghost"
      color="neutral"
      :icon="IconFormatUnderlined"
      :tooltip="$t('pdf-export-format-underlined')"
      @click="emit('toggle-underlined-text')"
    />

    <Separator orientation="vertical" />

    <ButtonIcon
      variant="ghost"
      color="neutral"
      :icon="IconFormatListBulleted"
      :tooltip="$t('pdf-export-format-bulleted-list')"
    />
    <ButtonIcon
      variant="ghost"
      color="neutral"
      :icon="IconFormatListNumbered"
      :tooltip="$t('pdf-export-format-numbered-list')"
    />

    <Separator orientation="vertical" />

    <ButtonIcon variant="ghost" color="neutral" :icon="IconFormatLink" :tooltip="$t('pdf-export-format-link')" />
    <ButtonIcon variant="ghost" color="neutral" :icon="IconFormatImage" :tooltip="$t('pdf-export-format-image')" />
    <ButtonIcon variant="ghost" color="neutral" :icon="IconFormatTable" :tooltip="$t('pdf-export-format-table')" />
  </div>
</template>

<style module>
.root {
  display: flex;
  gap: calc(var(--spacing) * 1);

  height: 100%;
  min-height: 0;
}
</style>
