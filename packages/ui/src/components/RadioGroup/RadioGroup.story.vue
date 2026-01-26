<script setup lang="ts">
  import { logEvent } from "histoire/client";
  import { ref, reactive } from "vue";

  import type { RadioGroupItem, RadioGroupProps } from "./RadioGroup.vue";
  import RadioGroup from "./RadioGroup.vue";

  const sizes = ["sm", "md", "lg"] as const;

  const items = ref<RadioGroupItem[]>([
    { value: 1, label: "Option 1", description: "Description 1" },
    { value: 2, label: "Option 2", description: "Description 2" },
    { value: 3, label: "Option 3", description: "Description 3" },
  ]);

  const state = reactive<RadioGroupProps>({
    size: "md",

    disabled: false,
  });

  defineExpose({ state });
</script>

<template>
  <Story id="radio-group" group="form" title="RadioGroup" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <RadioGroup
        v-bind="state"
        :items="items"
        @update:model-value="logEvent('update:model-value', { value: $event })"
      />

      <template #controls>
        <HstSelect v-model="state.size" title="Size" :options="sizes" />

        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <RadioGroup :size="size" :items="[`Size: ${size}`]" />
        </template>
      </div>
    </Variant>

    <Variant id="states" title="States" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <RadioGroup :items="['Default']" />
        <RadioGroup :items="['Disabled']" disabled />
      </div>
    </Variant>
  </Story>
</template>
