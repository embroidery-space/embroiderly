<template>
  <UModal :title="$t('fabric-properties')" :ui="{ body: '!pt-0' }">
    <template #body>
      <FabricForm v-model="fabric as Fabric" />
    </template>
    <template #footer>
      <UButton :label="$t('modal-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <UButton :label="$t('modal-save')" @click="emit('close', fabric as Fabric)" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { ref, toRaw } from "vue";

  import { Fabric } from "~/core/pattern/";

  import FabricForm from "./FabricForm.vue";

  const props = defineProps<{ fabric: Fabric }>();
  const emit = defineEmits<{ close: [fabric?: Fabric] }>();

  const fabric = ref<Fabric>(new Fabric(toRaw(props.fabric)));
</script>
