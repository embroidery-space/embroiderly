<script setup lang="ts">
  import { logEvent } from "histoire/client";
  import { reactive, ref } from "vue";

  import Icon from "../Icon/Icon.vue";

  import type { InputProps } from "./Input.vue";
  import Input from "./Input.vue";

  const sizes = ["sm", "md", "lg"] as const;

  const value = ref("Lorem ipsum");
  const state = reactive<InputProps>({
    size: "md",

    disabled: false,
  });

  defineExpose({ state });
</script>

<template>
  <Story id="input" group="form" title="Input" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <Input v-model="value" v-bind="state" @update:model-value="logEvent('update:model-value', { value: $event })" />

      <template #controls>
        <HstSelect v-model="state.size" title="Size" :options="sizes" />

        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <Input :model-value="`Size: ${size}`" :size="size" />
        </template>
      </div>
    </Variant>

    <Variant id="states" title="States" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <Input model-value="Default" />
        <Input model-value="Disabled" disabled />
      </div>
    </Variant>

    <Variant id="with-slots" title="With Slots" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <Input model-value="With leading slot">
          <template #leading>
            <Icon name="lucide:rocket" />
          </template>
        </Input>

        <Input model-value="With trailing slot">
          <template #trailing>
            <Icon name="lucide:rocket" />
          </template>
        </Input>

        <Input model-value="With both slots">
          <template #leading>
            <Icon name="lucide:rocket" />
          </template>
          <template #trailing>
            <Icon name="lucide:rocket" />
          </template>
        </Input>
      </div>
    </Variant>
  </Story>
</template>
