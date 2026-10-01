<script setup lang="ts">
import Toast from "../Toast.vue";
import Toaster from "../Toaster.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Toaster :portal="false" :duration="Infinity">
    <Toast v-bind="$attrs" class="toast-demo-toast" />
  </Toaster>
</template>

<style>
.toast-demo-toast {
  width: var(--container-2xs);
}
</style>
