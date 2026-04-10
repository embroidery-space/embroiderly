<script setup lang="ts">
import { reactive, ref } from "vue";

import Editable from "./Editable.vue";
import type { EditableProps } from "./Editable.vue";

const value = ref("Hello World!");
const state = reactive<EditableProps>({
  disabled: false,
  autoResize: false,

  activationMode: "dblclick",
  submitMode: "both",
});

defineExpose({ state });
</script>

<template>
  <Story id="editable" group="form" title="Editable" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <Editable v-model="value" v-bind="state" />

      <template #controls>
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstCheckbox v-model="state.autoResize" title="Auto Resize" />

        <HstSelect v-model="state.activationMode" title="Activation Mode" :options="['dblclick', 'focus']" />
        <HstSelect v-model="state.submitMode" title="Submit Mode" :options="['both', 'enter', 'blur']" />
      </template>
    </Variant>
  </Story>
</template>
