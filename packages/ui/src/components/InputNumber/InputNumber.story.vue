<script setup lang="ts">
  import { logEvent } from "histoire/client";
  import { reactive, ref } from "vue";

  import type { InputNumberProps } from "./InputNumber.vue";
  import InputNumber from "./InputNumber.vue";

  const sizes = ["sm", "md", "lg"] as const;
  const variants = ["subtle", "outline"] as const;

  const state = reactive<InputNumberProps>({
    placeholder: "Enter a number...",

    size: "md",
    variant: "subtle",

    min: 0,
    max: 10,
    step: 1,

    readonly: false,
    disabled: false,

    increment: true,
    decrement: true,
  });

  const value = ref(5);

  defineExpose({ state });
</script>

<template>
  <Story id="input-number" group="form" title="InputNumber" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <InputNumber
        v-model="value"
        v-bind="state"
        @update:model-value="logEvent('update:model-value', $event)"
        @blur="logEvent('blur', $event)"
        @change="logEvent('change', $event)"
      />

      <template #controls>
        <HstText v-model="state.placeholder" title="Placeholder" />

        <HstSelect v-model="state.size" title="Size" :options="sizes" />
        <HstSelect v-model="state.variant" title="Variant" :options="variants" />

        <HstNumber v-model="state.min" title="Min" />
        <HstNumber v-model="state.max" title="Max" />
        <HstNumber v-model="state.step" title="Step" />

        <HstCheckbox v-model="state.readonly" title="Readonly" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />

        <HstCheckbox v-model="state.increment" title="Increment" />
        <HstCheckbox v-model="state.decrement" title="Decrement" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <InputNumber :size="size" :placeholder="`Size: ${size}`" />
        </template>
      </div>
    </Variant>

    <Variant id="variants" title="Variants" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <template v-for="variant in variants" :key="variant">
          <InputNumber :variant="variant" :placeholder="`Variant: ${variant}`" />
        </template>
      </div>
    </Variant>

    <Variant id="states" title="States" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <InputNumber placeholder="Default" />
        <InputNumber placeholder="Readonly" readonly />
        <InputNumber placeholder="Disabled" disabled />
      </div>
    </Variant>
  </Story>
</template>
