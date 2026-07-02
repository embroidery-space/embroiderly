<script setup lang="ts">
import { reactive } from "vue";

import Button from "../Button/Button.vue";

import Tooltip from "./Tooltip.vue";
import type { TooltipProps } from "./Tooltip.vue";

const sides = ["top", "right", "bottom", "left"] as const;
const aligns = ["start", "center", "end"] as const;

const state = reactive<TooltipProps>({
  text: "Lorem ipsum",
  shortcut: "Ctrl+B",

  side: "bottom",
  align: "center",

  delayDuration: 200,

  disabled: false,
});

defineExpose({ state });
</script>

<template>
  <Story id="tooltip" group="overlay" title="Tooltip" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <Tooltip v-bind="state" default-open>
        <Button label="Button" />
      </Tooltip>

      <template #controls>
        <HstText v-model="state.text" title="text" />
        <HstText v-model="state.shortcut" title="shortcut" />

        <HstSelect v-model="state.side" title="Side" :options="sides" />
        <HstSelect v-model="state.align" title="Align" :options="aligns" />

        <HstNumber v-model="state.delayDuration" title="Delay Duration" />

        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>
  </Story>
</template>
