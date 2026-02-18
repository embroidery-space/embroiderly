<script setup lang="ts">
import { ref, toRaw } from "vue";

import { Fabric } from "#pattern-editor/lib/pattern/";

import FabricForm from "./FabricForm.vue";

const props = defineProps<{ fabric: Fabric; onSave?: (fabric: Fabric) => void | Promise<void> }>();
const emit = defineEmits<{ close: [] }>();

const fabric = ref<Fabric>(new Fabric(toRaw(props.fabric)));

async function handleSave() {
  await props.onSave?.(fabric.value as Fabric);
  emit("close");
}
</script>

<template>
  <UModal :title="$t('fabric-properties')" :ui="{ body: '!pt-0' }">
    <template #body>
      <FabricForm v-model="fabric as Fabric" />
    </template>
    <template #footer>
      <UButton :label="$t('modal-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <UButton loading-auto :label="$t('modal-save')" @click="handleSave" />
    </template>
  </UModal>
</template>
