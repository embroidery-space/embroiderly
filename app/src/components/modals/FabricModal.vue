<template>
  <UModal :title="$t('title-fabric-properties')" :ui="{ body: '!pt-0' }">
    <template #body>
      <!-- @vue-expect-error For some reason, TypeScript can't resolve the type of the `Fabric.color` property. -->
      <FabricForm v-model="fabric" />
    </template>
    <template #footer>
      <UButton :label="$t('label-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <UButton :label="$t('label-save')" @click="updateFabric" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { Fabric } from "~/core/pattern/";

  const props = defineProps<{ fabric?: Fabric }>();
  const emit = defineEmits<{ close: [] }>();

  const patternsStore = usePatternsStore();

  // Copy the data from the props to a reactive object.
  const fabric = ref<Fabric>(new Fabric(Object.assign(Fabric.default(), props.fabric)));

  async function updateFabric() {
    // @ts-expect-error For some reason, TypeScript can't resolve the type of the `Fabric.color` property.
    if (props.fabric === undefined) await patternsStore.createPattern(fabric.value);
    // @ts-expect-error The same as above.
    else await patternsStore.updateFabric(fabric.value);
    emit("close");
  }
</script>
