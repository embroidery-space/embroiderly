<template>
  <div :class="$style.root">
    <svg v-if="!$slots.default" :class="$style.pattern" fill="none">
      <defs>
        <pattern
          id="pattern-5c1e4f0e-62d5-498b-8ff0-cf77bb448c8e"
          x="0"
          y="0"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3" />
        </pattern>
      </defs>
      <rect stroke="none" fill="url(#pattern-5c1e4f0e-62d5-498b-8ff0-cf77bb448c8e)" width="100%" height="100%" />
    </svg>

    <slot />
  </div>
</template>

<style module>
/* Workaround to allow the story demos to always override the placeholder's styles. */
:where(.root) {
  position: relative;

  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  padding-inline: calc(var(--spacing) * 4);
  border: 1px dashed var(--border-color-accented);
  border-radius: var(--radius-sm);

  opacity: 75%;
}

:where(.pattern) {
  position: absolute;
  inset: 0;

  width: 100%;
  height: 100%;

  stroke: color-mix(in oklab, var(--border-color-inverted) 10%, transparent);
}
</style>
