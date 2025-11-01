<template>
  <div ref="container" :aria-busy="blocked">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
  import { ref, useTemplateRef, watch } from "vue";

  const { blocked } = defineProps<{ blocked: boolean }>();

  const container = useTemplateRef("container");
  const mask = ref<HTMLDivElement | null>(null);

  watch(
    () => blocked,
    (newValue) => {
      if (newValue === true) block();
      else unblock();
    },
    { immediate: true },
  );

  function block() {
    mask.value = document.createElement("div");
    mask.value.classList = "absolute top-0 left-0 z-0 w-full h-full bg-black/50";
    container.value!.appendChild(mask.value);
  }

  function unblock() {
    if (mask.value) {
      container.value!.removeChild(mask.value);
      mask.value = null;
    }
  }
</script>
