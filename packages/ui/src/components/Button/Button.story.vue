<script setup lang="ts">
  import { reactive } from "vue";

  import type { ButtonProps } from "./Button.vue";
  import Button from "./Button.vue";

  const colors = ["primary", "neutral"] as const;
  const variants = ["solid", "outline", "soft", "subtle", "ghost", "link"] as const;
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const;

  const state = reactive<ButtonProps>({
    label: "Button",

    color: "primary",
    variant: "solid",
    size: "md",

    leadingIcon: "",
    trailingIcon: "",

    loading: false,
    disabled: false,
    square: false,
  });

  defineExpose({ state });
</script>

<template>
  <Story id="button" group="element" title="Button" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <Button v-bind="state" />

      <template #controls>
        <HstText v-model="state.label" title="Label" />

        <HstSelect v-model="state.variant" title="Variant" :options="variants" />
        <HstSelect v-model="state.color" title="Color" :options="colors" />
        <HstSelect v-model="state.size" title="Size" :options="sizes" />

        <HstText v-model="state.leadingIcon" title="Leading Icon" />
        <HstText v-model="state.trailingIcon" title="Trailing Icon" />

        <HstCheckbox v-model="state.loading" title="Loading" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstCheckbox v-model="state.square" title="Square" />
      </template>
    </Variant>

    <Variant id="colors-and-variants" title="Colors & Variants" auto-props-disabled>
      <div class="grid grid-cols-6 grid-rows-2 gap-2">
        <template v-for="color in colors" :key="color">
          <template v-for="variant in variants" :key="variant">
            <Button :variant="variant" :color="color">{{ `${variant} ${color}` }}</Button>
          </template>
        </template>

        <Button leading-icon="lucide:rocket">Leading Icon</Button>
        <Button trailing-icon="lucide:rocket">Trailing Icon</Button>
        <Button leading-icon="lucide:rocket" trailing-icon="lucide:rocket">Button</Button>

        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
      </div>
    </Variant>

    <Variant id="square" title="Square" auto-props-disabled>
      <div class="flex items-center gap-2">
        <template v-for="size in sizes" :key="size">
          <Button :size="size" square icon="lucide:rocket" />
        </template>
      </div>
    </Variant>
  </Story>
</template>
