<template>
  <slot />
</template>

<script lang="ts" setup>
  import { useEventListener } from "@vueuse/core";
  import { provide } from "vue";

  import { SHORTCUTS_CONTEXT_INJECTION_KEY } from "../composables/useShortcuts.ts";
  import { ShortcutsContext } from "../lib/context.ts";
  import { createKeydownHandler } from "../lib/key-handler.ts";
  import type { ShortcutsOptions } from "../types.ts";

  export type ShortcutsProviderProps = ShortcutsOptions;

  const props = defineProps<ShortcutsProviderProps>();

  const ctx = new ShortcutsContext(props);
  provide(SHORTCUTS_CONTEXT_INJECTION_KEY, ctx);

  useEventListener("keydown", createKeydownHandler(ctx));
</script>
