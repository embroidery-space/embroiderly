<script setup lang="ts">
  import { logEvent } from "histoire/client";
  import { reactive, ref } from "vue";

  import type { InputColorProps } from "./InputColor.vue";
  import InputColor from "./InputColor.vue";

  const sizes = ["sm", "md", "lg"] as const;

  const color = ref("FF0000");
  const state = reactive<InputColorProps>({
    size: "lg",

    disabled: false,
  });

  defineExpose({ state });
</script>

<template>
  <Story id="input-color" group="form" title="InputColor" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <InputColor
        v-model="color"
        v-bind="state"
        @update:model-value="logEvent('update:model-value', { value: $event })"
      />

      <template #controls>
        <HstSelect v-model="state.size" title="Input Size" :options="sizes" />

        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <InputColor :size="size" />
        </template>
      </div>
    </Variant>

    <Variant id="states" title="States" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <InputColor />
        <InputColor disabled />
      </div>
    </Variant>
  </Story>
</template>
