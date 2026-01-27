<script setup lang="ts">
  import { reactive } from "vue";

  import Button from "../Button/Button.vue";

  import type { PopoverProps } from "./Popover.vue";
  import Popover from "./Popover.vue";

  const sides = ["top", "right", "bottom", "left"] as const;

  const state = reactive<PopoverProps>({
    content: {
      side: "bottom",
      sideOffset: 4,
    },

    arrow: false,
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
        <HstSelect v-model="state.content!.side" title="Side" :options="sides" />
        <HstNumber v-model="state.content!.sideOffset" title="Side Offset" />

        <HstCheckbox v-model="state.arrow" title="Arrow" />
        <HstCheckbox v-model="state.modal" title="Modal" />
      </template>
    </Variant>
  </Story>
</template>
