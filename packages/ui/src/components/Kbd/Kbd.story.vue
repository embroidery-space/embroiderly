<script setup lang="ts">
  import { reactive, ref } from "vue";

  import { parseShortcutDisplay } from "../../utils/shortcut.ts";

  import type { KbdProps } from "./Kbd.vue";
  import Kbd from "./Kbd.vue";

  const sizes = ["sm", "md", "lg"] as const;

  const value = ref("K");
  const state = reactive<KbdProps>({
    size: "md",
  });

  defineExpose({ state });
</script>

<template>
  <Story id="kbd" group="element" title="Kbd" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <div class="flex items-center gap-1">
        <Kbd v-for="(key, i) in parseShortcutDisplay(value)" :key="i" :value="key" v-bind="state" />
      </div>

      <template #controls>
        <HstText v-model="value" title="Value" />
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes">
      <div class="flex items-center gap-1">
        <Kbd v-for="size in sizes" :key="size" :value="size.toUpperCase()" :size="size" />
      </div>
    </Variant>
  </Story>
</template>
