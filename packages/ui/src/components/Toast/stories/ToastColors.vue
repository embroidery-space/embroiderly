<script setup lang="ts">
import Toast from "../Toast.vue";
import Toaster from "../Toaster.vue";

const colors = ["primary", "error", "warning", "success", "info", "help", "neutral"] as const;
</script>

<template>
  <Toaster :portal="false" :duration="Infinity">
    <div id="toast-colors">
      <Toast v-for="color in colors" :key="color" :color="color" :title="color" open class="toast-colors-toast" />
    </div>
  </Toaster>
</template>

<style>
#toast-colors {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
}

.toast-colors-toast {
  width: var(--container-2xs);
}
</style>
