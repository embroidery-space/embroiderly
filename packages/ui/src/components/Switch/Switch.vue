<script setup lang="ts">
  import { SwitchRoot, SwitchThumb, Primitive, Label } from "reka-ui";
  import type { SwitchRootProps } from "reka-ui";
  import { computed, useId } from "vue";

  import { SwitchTheme } from "./Switch.theme";
  import type { SwitchThemeSlots, SwitchThemeVariants } from "./Switch.theme";

  export interface SwitchProps extends Pick<SwitchRootProps, "as" | "asChild" | "id" | "disabled"> {
    /** The label of the switch. */
    label?: string;
    /** The description of the switch. */
    description?: string;

    /**
     * The color of the switch.
     * @default "primary"
     */
    color?: SwitchThemeVariants["color"];
    /**
     * The size of the switch.
     * @default "md"
     */
    size?: SwitchThemeVariants["size"];

    class?: any;
    ui?: SwitchThemeSlots;
  }

  defineOptions({ inheritAttrs: false });

  const modelValue = defineModel<boolean>();
  const props = withDefaults(defineProps<SwitchProps>(), {
    color: "primary",
    size: "md",
  });

  const id = computed(() => props.id ?? useId());

  const ui = computed(() => {
    return SwitchTheme({
      color: props.color,
      size: props.size,

      disabled: props.disabled,
    });
  });
</script>

<template>
  <Primitive :as="as" :as-child="asChild" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <div :class="ui.container({ class: props.ui?.container })">
      <SwitchRoot
        :id="id"
        v-model="modelValue"
        v-bind="$attrs"
        :disabled="disabled"
        :class="ui.base({ class: props.ui?.base })"
      >
        <SwitchThumb :class="ui.thumb({ class: props.ui?.thumb })" />
      </SwitchRoot>
    </div>

    <div v-if="label || description" :class="ui.wrapper({ class: props.ui?.wrapper })">
      <Label v-if="label" :for="id" :class="ui.label({ class: props.ui?.label })">{{ label }}</Label>
      <p v-if="description" :class="ui.description({ class: props.ui?.description })">{{ description }}</p>
    </div>
  </Primitive>
</template>
