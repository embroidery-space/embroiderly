<script setup lang="ts">
import Icon from "../../Icon/Icon.vue";
import Input from "../Input.vue";
</script>

<template>
  <div id="input-with-slots">
    <Input model-value="With leading slot">
      <template #leading>
        <Icon name="lucide:rocket" />
      </template>
    </Input>

    <Input model-value="With trailing slot">
      <template #trailing>
        <Icon name="lucide:rocket" />
      </template>
    </Input>

    <Input model-value="With both slots">
      <template #leading>
        <Icon name="lucide:rocket" />
      </template>
      <template #trailing>
        <Icon name="lucide:rocket" />
      </template>
    </Input>
  </div>
</template>

<style>
#input-with-slots {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>
