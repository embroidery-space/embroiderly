<template>
  <div class="flex size-full flex-col">
    <div v-if="$slots.header">
      <slot name="header" />
    </div>

    <div class="flex grow items-center justify-center overflow-hidden">
      <slot />
    </div>

    <div v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </div>
</template>
