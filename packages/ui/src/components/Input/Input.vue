<script setup lang="ts">
  import { Primitive } from "reka-ui";
  import type { PrimitiveProps } from "reka-ui";
  import { computed, useSlots } from "vue";

  import type { InputHTMLAttributes } from "../../types/html.ts";

  import { InputTheme } from "./Input.theme.ts";
  import type { InputThemeSlots, InputThemeVariants } from "./Input.theme.ts";

  export interface InputProps extends PrimitiveProps, /* @vue-ignore */ InputHTMLAttributes {
    id?: string;

    /**
     * The color scheme of the input.
     * @default "primary"
     */
    color?: InputThemeVariants["color"];
    /**
     * The style variant of the input.
     * @default "subtle"
     */
    variant?: InputThemeVariants["variant"];
    /**
     * The size of the input.
     * @default "lg"
     */
    size?: InputThemeVariants["size"];

    class?: any;
    ui?: InputThemeSlots;
  }

  export interface InputEmits {
    "update:modelValue": [value: string];
    blur: [event: FocusEvent];
    change: [event: Event];
  }

  export interface InputSlots {
    leading(): any;
    default(): any;
    trailing(): any;
  }

  defineOptions({ inheritAttrs: false });

  const modelValue = defineModel<string>();
  const props = withDefaults(defineProps<InputProps>(), {
    as: "div",

    color: "primary",
    variant: "subtle",
    size: "lg",
  });
  const emits = defineEmits<InputEmits>();
  const slots = useSlots();

  const ui = computed(() => {
    return InputTheme({
      color: props.color,
      variant: props.variant,
      size: props.size,

      leading: !!slots.leading,
      trailing: !!slots.trailing,
    });
  });
</script>

<template>
  <Primitive :as="as" :as-child="asChild" :class="ui.root({ class: props.ui?.root })">
    <input
      :id="id"
      v-model="modelValue"
      type="text"
      :name="name"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :autofocus="autofocus"
      :maxlength="maxlength"
      :minlength="minlength"
      :disabled="disabled"
      :readonly="readonly"
      :class="ui.base({ class: [props.class, props.ui?.base] })"
      v-bind="$attrs"
      @blur="emits('blur', $event)"
      @change="emits('change', $event)"
    />

    <slot />

    <span v-if="!!slots.leading" :class="ui.leading({ class: props.ui?.leading })">
      <slot name="leading" />
    </span>

    <span v-if="!!slots.trailing" :class="ui.trailing({ class: props.ui?.trailing })">
      <slot name="trailing" />
    </span>
  </Primitive>
</template>
