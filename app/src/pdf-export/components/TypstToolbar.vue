<script setup lang="ts">
import {
  Button,
  ButtonIcon,
  DropdownMenu,
  Form,
  FormField,
  Input,
  Popover,
  Select,
  Separator,
  useConfirm,
} from "@embroiderly/ui";

import { computed } from "vue";
import z from "zod";

import {
  IconChevronDown,
  IconClose,
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
  IconFormatAttachPatternOxs,
} from "~/assets/icons/";

const props = defineProps<{
  currentSelection?: string;
  images?: string[];
}>();
const emit = defineEmits<{
  "toggle-heading": [level: number];

  "toggle-bold-text": [];
  "toggle-italic-text": [];
  "toggle-underlined-text": [];

  "toggle-bulleted-list": [];
  "toggle-numbered-list": [];

  "insert-link": [url: string, displayText?: string];
  "insert-image": [fileName: string, alt?: string];

  "attach-pattern-oxs": [];
}>();

const confirm = useConfirm();

const currentSelectionIsURL = computed(() => z.url().validate(props.currentSelection));
</script>

<template>
  <div :class="$style.root">
    <DropdownMenu
      :items="
        [IconFormatH1, IconFormatH2, IconFormatH3, IconFormatH4, IconFormatH5, IconFormatH6].map((icon, index) => {
          const level = index + 1;
          return {
            icon,
            label: $t('pdf-export-format-heading-n', { level }),
            onSelect: () => emit('toggle-heading', level),
          };
        })
      "
    >
      <Button
        variant="ghost"
        color="neutral"
        :trailing-icon="IconChevronDown"
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
      @click="emit('toggle-bulleted-list')"
    />
    <ButtonIcon
      variant="ghost"
      color="neutral"
      :icon="IconFormatListNumbered"
      :tooltip="$t('pdf-export-format-numbered-list')"
      @click="emit('toggle-numbered-list')"
    />

    <Separator orientation="vertical" />

    <Popover pinned>
      <template #default="{ open }">
        <ButtonIcon
          color="neutral"
          :variant="open ? 'soft' : 'ghost'"
          :icon="open ? IconClose : IconFormatLink"
          :tooltip="$t('pdf-export-format-link')"
        />
      </template>

      <template #content="{ close }">
        <Form
          :schema="
            z.object({
              url: z.url($t('pdf-export-format-link-url-invalid')),
              displayText: z.string().optional(),
            })
          "
          :class="$style.form"
          @submit="
            ({ url, displayText }) => {
              emit('insert-link', url, displayText);
              close();
            }
          "
        >
          <FormField name="url" :label="$t('pdf-export-format-link-url')">
            <Input :default-value="currentSelectionIsURL ? currentSelection : undefined" />
          </FormField>

          <FormField name="displayText" :label="$t('pdf-export-format-link-display-text')">
            <Input :default-value="currentSelectionIsURL ? undefined : currentSelection" />
          </FormField>

          <div :class="$style.formFooter">
            <Button type="submit" :label="$t('pdf-export-format-insert')" />
            <Button
              variant="link"
              href="https://typst.app/docs/reference/model/link/"
              target="_blank"
              :label="$t('pdf-export-format-learn-more')"
            />
          </div>
        </Form>
      </template>
    </Popover>

    <Popover pinned>
      <template #default="{ open }">
        <ButtonIcon
          color="neutral"
          :variant="open ? 'soft' : 'ghost'"
          :icon="open ? IconClose : IconFormatImage"
          :tooltip="$t('pdf-export-format-image')"
        />
      </template>

      <template #content="{ close }">
        <Form
          :schema="
            z.object({
              fileName: z.string($t('pdf-export-format-image-file-invalid')),
              alt: z.string().optional(),
            })
          "
          :class="$style.form"
          @submit="
            ({ fileName, alt }) => {
              emit('insert-image', fileName, alt);
              close();
            }
          "
        >
          <FormField name="fileName" v-bind="$ta('pdf-export-format-image-file')">
            <Select :items="images" />
          </FormField>

          <FormField name="alt" :label="$t('pdf-export-format-image-alt')">
            <Input />
          </FormField>

          <div :class="$style.formFooter">
            <Button type="submit" :label="$t('pdf-export-format-insert')" />
            <Button
              variant="link"
              href="https://typst.app/docs/reference/visualize/image/"
              target="blank"
              :label="$t('pdf-export-format-learn-more')"
            />
          </div>
        </Form>
      </template>
    </Popover>

    <ButtonIcon variant="ghost" color="neutral" :icon="IconFormatTable" :tooltip="$t('pdf-export-format-table')" />

    <Separator orientation="vertical" />

    <ButtonIcon
      variant="ghost"
      color="neutral"
      :icon="IconFormatAttachPatternOxs"
      :tooltip="$t('pdf-export-format-attach-pattern-oxs')"
      @click="
        async () => {
          const accepted = await confirm.open($ta('pdf-export-format-attach-pattern-oxs-confirmation')).result;
          if (accepted) emit('attach-pattern-oxs');
        }
      "
    />
  </div>
</template>

<style module>
.root {
  display: flex;
  gap: calc(var(--spacing) * 1);

  height: 100%;
  min-height: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
  align-items: start;

  width: var(--container-xs);

  padding: calc(var(--spacing) * 2);
}

.form-footer {
  display: flex;
  gap: calc(var(--spacing) * 2);
  align-items: center;
}
</style>
