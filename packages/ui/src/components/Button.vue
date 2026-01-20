<template>
  <Primitive
    data-slot="button"
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </Primitive>
</template>

<script setup lang="ts">
  import type { PrimitiveProps } from "reka-ui";
  import { Primitive } from "reka-ui";
  import type { HTMLAttributes } from "vue";

  import type { ButtonVariants } from "../theme/button.ts";
  import { buttonVariants } from "../theme/button.ts";
  import { cn } from "../utils/theme.ts";

  interface Props extends PrimitiveProps {
    variant?: ButtonVariants["variant"];
    size?: ButtonVariants["size"];
    class?: HTMLAttributes["class"];
  }

  const props = withDefaults(defineProps<Props>(), {
    as: "button",

    variant: "default",
    size: "default",

    class: undefined,
  });
</script>
