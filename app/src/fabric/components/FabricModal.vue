<script setup lang="ts">
import { Button, Dialog } from "@embroiderly/ui";

import { ref, toRaw } from "vue";

import { Fabric } from "~/lib/pattern/";

import FabricForm from "./FabricForm.vue";

const props = defineProps<{
  fabric: Fabric;
  mode: "create" | "edit";
  onSave?: (fabric: Fabric) => void | Promise<void>;
}>();
const emit = defineEmits<{ close: [] }>();

const fabric = ref<Fabric>(new Fabric(toRaw(props.fabric)));

async function handleSave() {
  await props.onSave?.(fabric.value as Fabric);
  emit("close");
}
</script>

<template>
  <Dialog
    :title="mode === 'create' ? $t('pattern-creation') : $t('fabric-properties')"
    :ui="{ body: 'pt-0!', content: 'w-2xl' }"
  >
    <template #body>
      <FabricForm v-model="fabric as Fabric" />
    </template>
    <template #footer>
      <Button :label="$t('modal-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <Button loading-auto :label="mode === 'create' ? $t('modal-create') : $t('modal-save')" @click="handleSave" />
    </template>
  </Dialog>
</template>
