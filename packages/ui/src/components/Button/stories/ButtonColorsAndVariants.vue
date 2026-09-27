<script setup lang="ts">
import Button from "../Button.vue";
import type { ButtonProps } from "../Button.vue";

const colors: NonNullable<ButtonProps["color"]>[] = ["primary", "neutral"];
const variants: NonNullable<ButtonProps["variant"]>[] = ["solid", "outline", "soft", "subtle", "ghost", "link"];
</script>

<template>
  <div id="button-colors-and-variants">
    <template v-for="color in colors" :key="color">
      <template v-for="variant in variants" :key="variant">
        <Button :variant="variant" :color="color">{{ variant }} {{ color }}</Button>
      </template>
    </template>

    <Button leading-icon="lucide:rocket">Leading Icon</Button>
    <Button trailing-icon="lucide:rocket">Trailing Icon</Button>
    <Button leading-icon="lucide:rocket" trailing-icon="lucide:rocket">Button</Button>

    <Button loading>Loading</Button>
    <Button disabled>Disabled</Button>
  </div>
</template>

<style>
#button-colors-and-variants {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 2);
}
</style>
