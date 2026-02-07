<script setup lang="ts">
  import { Primitive } from "reka-ui";
  import type { PrimitiveProps } from "reka-ui";
  import { computed, provide } from "vue";

  import { formFieldGroupInjectionKey } from "../../composables/useFormFieldGroup.ts";

  import { FormFieldGroupTheme } from "./FormFieldGroup.theme.ts";
  import type { FormFieldGroupThemeVariants } from "./FormFieldGroup.theme.ts";

  export interface FormFieldGroupProps extends PrimitiveProps {
    /**
     * The size of the grouped children.
     * @default "md"
     */
    size?: FormFieldGroupThemeVariants["size"];

    class?: any;
    ui?: { base?: string };
  }

  const props = withDefaults(defineProps<FormFieldGroupProps>(), {
    as: "div",

    size: "md",
  });

  provide(
    formFieldGroupInjectionKey,
    computed(() => ({ size: props.size })),
  );

  const theme = computed(() => {
    return FormFieldGroupTheme({
      size: props.size,
      class: [props.ui?.base, props.class],
    });
  });
</script>

<template>
  <Primitive :as="as" :as-child="asChild" :class="theme">
    <slot />
  </Primitive>
</template>
