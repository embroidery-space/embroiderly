<script lang="ts" setup>
import { useEventListener } from "@vueuse/core";
import { provide } from "vue";

import { SHORTCUTS_INJECTION_KEY } from "../constants.ts";
import { createKeydownHandler, ShortcutsContext } from "../lib/";
import type { ShortcutsOptions } from "../types.ts";

export type ShortcutsProviderProps = ShortcutsOptions;

const props = defineProps<ShortcutsProviderProps>();

const ctx = new ShortcutsContext(props);
provide(SHORTCUTS_INJECTION_KEY, ctx);

useEventListener("keydown", createKeydownHandler(ctx));
</script>

<template>
  <slot />
</template>
