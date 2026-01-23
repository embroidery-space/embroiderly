<script setup lang="ts">
  import { reactive } from "vue";

  import Button from "./Button.vue";
  import type { TooltipProps } from "./Tooltip.vue";
  import Tooltip from "./Tooltip.vue";

  const sides = ["top", "right", "bottom", "left"] as const;

  const state = reactive<TooltipProps>({
    text: "Lorem ipsum",

    content: {
      side: "bottom",
      sideOffset: 8,
    },

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

        <HstSelect v-model="state.content!.side" title="Variant" :options="sides" />
        <HstNumber v-model="state.content!.sideOffset" title="Side Offset" />

        <HstNumber v-model="state.delayDuration" title="Delay Duration" />

        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>
  </Story>
</template>
