<template>
  <fieldset class="mt-2 rounded-md border border-default px-4 pb-4">
    <legend class="font-medium text-default">{{ props.legend }}</legend>
    <slot />
  </fieldset>
</template>

<script lang="ts" setup>
  const props = defineProps<{ legend: string }>();
</script>
