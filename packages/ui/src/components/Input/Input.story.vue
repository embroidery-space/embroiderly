<script setup lang="ts">
  import { logEvent } from "histoire/client";
  import { reactive } from "vue";

  import Icon from "../Icon/Icon.vue";

  import type { InputProps } from "./Input.vue";
  import Input from "./Input.vue";

  const sizes = ["sm", "md", "lg"] as const;

  const state = reactive<InputProps>({
    placeholder: "Enter text...",

    size: "md",

    readonly: false,
    disabled: false,
  });

  defineExpose({ state });
</script>

<template>
  <Story id="input" group="form" title="Input" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <Input
        v-bind="state"
        @update:model-value="logEvent('update:model-value', $event)"
        @blur="logEvent('blur', $event)"
        @change="logEvent('change', $event)"
      />

      <template #controls>
        <HstText v-model="state.placeholder" title="Placeholder" />

        <HstSelect v-model="state.size" title="Size" :options="sizes" />

        <HstCheckbox v-model="state.readonly" title="Readonly" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <Input :size="size" :placeholder="`Size: ${size}`" />
        </template>
      </div>
    </Variant>

    <Variant id="states" title="States" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <Input placeholder="Default" />
        <Input placeholder="Readonly" readonly />
        <Input placeholder="Disabled" disabled />
      </div>
    </Variant>

    <Variant id="with-slots" title="With Slots" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <Input placeholder="With leading slot">
          <template #leading>
            <Icon name="lucide:rocket" />
          </template>
        </Input>

        <Input placeholder="With trailing slot">
          <template #trailing>
            <Icon name="lucide:rocket" />
          </template>
        </Input>

        <Input placeholder="With both slots">
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
