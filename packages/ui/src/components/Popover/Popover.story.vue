<script setup lang="ts">
import { reactive } from "vue";

import Button from "../Button/Button.vue";

import Popover from "./Popover.vue";
import type { PopoverProps } from "./Popover.vue";

const sides = ["top", "right", "bottom", "left"] as const;
const aligns = ["start", "center", "end"] as const;

const state = reactive<PopoverProps>({
  side: "bottom",
  align: "center",
  modal: false,
});

defineExpose({ state });
</script>

<template>
  <Story id="popover" group="overlay" title="Popover" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <Popover v-bind="state" default-open>
        <Button label="Open Popover" />
        <template #content>
          <Placeholder class="m-4 inline-flex size-48" />
        </template>
      </Popover>

      <template #controls>
        <HstSelect v-model="state.side" title="Side" :options="sides" />
        <HstSelect v-model="state.align" title="Align" :options="aligns" />

        <HstCheckbox v-model="state.modal" title="Modal" />
      </template>
    </Variant>
  </Story>
</template>
