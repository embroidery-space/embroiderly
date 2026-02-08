<script setup lang="ts">
  import { logEvent } from "histoire/client";
  import { reactive, ref } from "vue";

  import type { FormFieldProps } from "../FormField/FormField.vue";
  import FormField from "../FormField/FormField.vue";

  import type { SelectItem, SelectProps } from "./Select.vue";
  import Select from "./Select.vue";

  const sizes = ["sm", "md", "lg"] as const;

  const items = ref<SelectItem[]>([
    { label: "Backlog", value: "backlog" },
    { label: "Todo", value: "todo" },
    { label: "In Progress", value: "in-progress" },
    { label: "Done", value: "done" },
    { label: "Cancelled", value: "cancelled" },
  ]);

  const inputState = reactive<SelectProps>({
    disabled: false,
    loading: false,
    searchInput: false,
    placeholder: "Select a status...",
  });
  const formFieldState = reactive<FormFieldProps>({
    size: "md",
    label: "",
    description: "",
    hint: "",
    help: "",
  });

  defineExpose({ inputState, formFieldState });
</script>

<template>
  <Story id="select" group="form" title="Select" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <FormField v-bind="formFieldState">
        <Select
          v-bind="inputState"
          :items="items"
          class="w-40"
          @update:model-value="logEvent('update:model-value', { value: $event })"
        />
      </FormField>

      <template #controls>
        <HstCheckbox v-model="inputState.disabled" title="Disabled" />
        <HstCheckbox v-model="inputState.loading" title="Loading" />
        <HstCheckbox v-model="inputState.searchInput as boolean" title="Search Input" />
        <HstSelect v-model="formFieldState.size" title="Size" :options="sizes" />
        <HstText v-model="formFieldState.label" title="Label" />
        <HstText v-model="formFieldState.description" title="Description" />
        <HstText v-model="formFieldState.hint" title="Hint" />
        <HstText v-model="formFieldState.help" title="Help" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <Select :items="items" :size="size" :model-value="'todo'" class="w-40" />
        </template>
      </div>
    </Variant>

    <Variant id="states" title="States" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <Select :items="items" placeholder="Default" class="w-40" />
        <Select :items="items" placeholder="Loading" loading class="w-40" />
        <Select :items="items" placeholder="Disabled" disabled class="w-40" />
      </div>
    </Variant>
  </Story>
</template>
