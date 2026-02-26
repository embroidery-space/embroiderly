<script setup lang="ts">
import defu from "defu";
import { useFilter } from "reka-ui";
import { Combobox } from "reka-ui/namespaced";
import { computed, ref, toRef } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { useFormField } from "../../composables/useFormField.ts";
import { useFormFieldGroup } from "../../composables/useFormFieldGroup.ts";
import { useLocale } from "../../composables/useLocale.ts";
import { usePortal } from "../../composables/usePortal.ts";
import type { IconValue } from "../../types/icons.ts";
import Icon from "../Icon/Icon.vue";
import Input from "../Input/Input.vue";
import type { InputProps } from "../Input/Input.vue";

import { SelectTheme } from "./Select.theme.ts";
import type { SelectThemeSlots, SelectThemeVariants } from "./Select.theme.ts";

export interface SelectItemObject {
  /** The type of the item. */
  type?: "separator" | "label";

  /** The label to display. */
  label?: string;
  /** The value of the item. Not used for `separator` and `label` types. */
  value?: string | number;

  /** An icon to display before the label. */
  icon?: IconValue;

  /** Whether the item is disabled. */
  disabled?: boolean;

  /** Additional CSS class(es) for the item. */
  class?: any;
}

export type SelectItem = string | number | SelectItemObject;

export interface SelectProps {
  id?: string;

  /** The items to display in the select. */
  items?: SelectItem[] | SelectItem[][];

  /** The placeholder text when no value is selected. */
  placeholder?: string;

  /**
   * Whether to show a search input in the dropdown.
   * Pass an object with `placeholder` to customize the search input placeholder.
   * @default false
   */
  searchInput?: boolean | InputProps;

  /**
   * The color scheme of the select.
   * @default "primary"
   */
  color?: SelectThemeVariants["color"];
  /**
   * The style variant of the select.
   * @default "subtle"
   */
  variant?: SelectThemeVariants["variant"];
  /**
   * The size of the select.
   * @default "lg"
   */
  size?: SelectThemeVariants["size"];

  /** Whether the select is in a loading state. */
  loading?: boolean;
  /** Whether the select is disabled. */
  disabled?: boolean;

  /**
   * Render the dropdown in a portal.
   * @default true
   */
  portal?: boolean | string | HTMLElement;

  class?: any;
  ui?: SelectThemeSlots;
}

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<string | number | undefined>();
const props = withDefaults(defineProps<SelectProps>(), {
  color: "primary",
  variant: "subtle",

  portal: true,
});

const { icons } = useComponentIcons();
const { contains } = useFilter({ sensitivity: "base" });
const { messages } = useLocale();

const { fieldGroup, fieldGroupSize } = useFormFieldGroup();
const { id, size: formFieldSize, ariaAttrs } = useFormField(props);
const size = computed(() => props.size ?? fieldGroupSize.value ?? formFieldSize.value);
const portalProps = usePortal(toRef(() => props.portal));
const searchInputProps = toRef(
  () => defu(props.searchInput, { placeholder: messages.value.select.search }) as InputProps,
);

const open = ref(false);
const searchValue = ref("");

const normalizedGroups = computed<SelectItemObject[][]>(() => {
  if (!props.items?.length) return [];
  if (Array.isArray(props.items[0])) {
    return (props.items as SelectItem[][]).map((group) => group.map((item) => normalizeItem(item)));
  }
  return [(props.items as SelectItem[]).map((item) => normalizeItem(item))];
});

const filteredGroups = computed<SelectItemObject[][]>(() => {
  if (!props.searchInput || !searchValue.value) return normalizedGroups.value;
  return normalizedGroups.value
    .map((group) =>
      group.filter((item) => {
        if (item.type === "separator" || item.type === "label") return false;
        return contains(item.label ?? "", searchValue.value);
      }),
    )
    .filter((group) => group.length > 0);
});

const displayValue = computed(() => {
  if (modelValue.value === null) return undefined;
  const found = normalizedGroups.value.flat().find((item) => !item.type && item.value === modelValue.value);
  return found?.label;
});

const ui = computed(() => {
  return SelectTheme({
    color: props.color,
    variant: props.variant,
    size: size.value,
    loading: props.loading,
    disabled: props.disabled,
    fieldGroup: fieldGroup.value,
  });
});

function normalizeItem(item: SelectItem): SelectItemObject {
  if (typeof item === "string" || typeof item === "number") {
    return { label: String(item), value: item };
  }
  return item;
}
</script>

<template>
  <Combobox.Root
    v-model="modelValue"
    :open="open"
    :disabled="disabled"
    :ignore-filter="!searchInput"
    :reset-search-term-on-blur="false"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
    @update:open="
      (value) => {
        open = value;
        if (!value) searchValue = '';
      }
    "
  >
    <Combobox.Anchor as-child>
      <Combobox.Trigger
        :id="id"
        v-bind="{ ...$attrs, ...ariaAttrs }"
        :disabled="disabled"
        data-slot="base"
        :class="ui.base({ class: [props.ui?.base] })"
      >
        <span v-if="displayValue" data-slot="value" :class="ui.value({ class: props.ui?.value })">
          {{ displayValue }}
        </span>
        <span v-else data-slot="placeholder" :class="ui.placeholder({ class: props.ui?.placeholder })">
          {{ placeholder }}
        </span>

        <Icon
          v-if="loading"
          :name="icons.loading"
          data-slot="trailingIcon"
          :class="ui.trailingIcon({ class: props.ui?.trailingIcon })"
        />
        <Icon
          v-else
          :name="icons.chevronDown"
          data-slot="trailingIcon"
          :class="ui.trailingIcon({ class: props.ui?.trailingIcon })"
        />
      </Combobox.Trigger>
    </Combobox.Anchor>

    <Combobox.Portal v-bind="portalProps">
      <Combobox.Content
        position="popper"
        :side-offset="4"
        :collision-padding="4"
        data-slot="content"
        :class="ui.content({ class: props.ui?.content })"
      >
        <Combobox.Input v-if="!!searchInput" v-model="searchValue" as-child>
          <Input
            v-bind="searchInputProps"
            autofocus
            autocomplete="off"
            :size="size"
            data-slot="input"
            :class="ui.input({ class: props.ui?.input })"
          />
        </Combobox.Input>

        <Combobox.Viewport data-slot="viewport" :class="ui.viewport({ class: props.ui?.viewport })">
          <Combobox.Empty data-slot="empty" :class="ui.empty({ class: props.ui?.empty })">
            {{ searchValue ? messages.select.noMatches : messages.select.noData }}
          </Combobox.Empty>

          <Combobox.Group
            v-for="(group, groupIndex) in filteredGroups"
            :key="`group-${groupIndex}`"
            data-slot="group"
            :class="ui.group({ class: props.ui?.group })"
          >
            <template v-for="(item, index) in group" :key="`group-${groupIndex}-${index}`">
              <Combobox.Separator
                v-if="item.type === 'separator'"
                data-slot="separator"
                :class="ui.separator({ class: [props.ui?.separator, item.class] })"
              />

              <Combobox.Label
                v-else-if="item.type === 'label'"
                data-slot="label"
                :class="ui.label({ class: [props.ui?.label, item.class] })"
              >
                {{ item.label }}
              </Combobox.Label>

              <Combobox.Item
                v-else
                :value="item.value!"
                :disabled="item.disabled"
                data-slot="item"
                :class="ui.item({ class: [props.ui?.item, item.class] })"
              >
                <Icon
                  v-if="item.icon"
                  :name="item.icon"
                  data-slot="itemLeadingIcon"
                  :class="ui.itemLeadingIcon({ class: props.ui?.itemLeadingIcon })"
                />
                <span data-slot="itemLabel" :class="ui.itemLabel({ class: props.ui?.itemLabel })">
                  {{ item.label }}
                </span>
                <Combobox.ItemIndicator>
                  <Icon
                    :name="icons.check"
                    data-slot="itemIndicator"
                    :class="ui.itemIndicator({ class: props.ui?.itemIndicator })"
                  />
                </Combobox.ItemIndicator>
              </Combobox.Item>
            </template>
          </Combobox.Group>
        </Combobox.Viewport>
      </Combobox.Content>
    </Combobox.Portal>
  </Combobox.Root>
</template>
