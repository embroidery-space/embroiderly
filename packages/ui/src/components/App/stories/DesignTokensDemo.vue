<script setup lang="ts">
const colors = [
  { label: "Primary", token: "--color-primary" },
  { label: "Error", token: "--color-error" },
  { label: "Warning", token: "--color-warning" },
  { label: "Success", token: "--color-success" },
  { label: "Info", token: "--color-info" },
  { label: "Help", token: "--color-help" },
];

const textColors = [
  { label: "Default", token: "--text-color-default" },
  { label: "Dimmed", token: "--text-color-dimmed" },
  { label: "Muted", token: "--text-color-muted" },
];

const backgroundColors = [
  { label: "Default", token: "--background-color-default" },
  { label: "Elevated", token: "--background-color-elevated" },
  { label: "Accented", token: "--background-color-accented" },
];

const borderColors = [
  { label: "Default", token: "--border-color-default" },
  { label: "Elevated", token: "--border-color-elevated" },
  { label: "Accented", token: "--border-color-accented" },
  { label: "Inverted", token: "--border-color-inverted" },
];

const radii = [
  { label: "none", value: "0" },
  { label: "xs", value: "var(--radius-xs)" },
  { label: "sm", value: "var(--radius-sm)" },
  { label: "md", value: "var(--radius-md)" },
  { label: "lg", value: "var(--radius-lg)" },
  { label: "xl", value: "var(--radius-xl)" },
  { label: "2xl", value: "var(--radius-2xl)" },
  { label: "3xl", value: "var(--radius-3xl)" },
];
</script>

<template>
  <div id="design-tokens">
    <h3>Colors</h3>
    <div>
      <span v-for="{ label, token } in colors" :key="token" :style="{ color: `var(${token})` }">{{ label }}</span>
    </div>

    <h3>Text</h3>
    <div>
      <span v-for="{ label, token } in textColors" :key="token" :style="{ color: `var(${token})` }">{{ label }}</span>
      <span class="inverted">Inverted</span>
    </div>

    <h3>Background</h3>
    <div>
      <div
        v-for="{ label, token } in backgroundColors"
        :key="token"
        class="rounded"
        :style="{ backgroundColor: `var(${token})` }"
      >
        {{ label }}
      </div>
      <div class="inverted">Inverted</div>
    </div>

    <h3>Border</h3>
    <div>
      <div
        v-for="{ label, token } in borderColors"
        :key="token"
        class="rounded"
        :style="{ border: `1px solid var(${token})` }"
      >
        {{ label }}
      </div>
    </div>

    <h3>Radius</h3>
    <div>
      <div v-for="{ label, value } in radii" :key="label" class="radius" :style="{ borderRadius: value }">
        {{ label }}
      </div>
    </div>
  </div>
</template>

<style>
#design-tokens {
  & > h3 {
    margin-bottom: calc(var(--spacing) * 3);
    font-size: var(--text-lg);
    font-weight: var(--font-weight-semibold);
    line-height: var(--text-lg--line-height);
  }

  & > div {
    display: flex;
    column-gap: calc(var(--spacing) * 2);
    align-items: center;

    &:not(:last-child) {
      margin-bottom: calc(var(--spacing) * 6);
    }

    & > * {
      display: inline-block;
      padding-block: calc(var(--spacing) * 1.5);
      padding-inline: calc(var(--spacing) * 4);
      font-weight: var(--font-weight-bold);
    }
  }

  .rounded {
    border-radius: var(--radius-md);
  }

  .inverted {
    border-radius: var(--radius-md);
    color: var(--text-color-inverted);
    background-color: var(--background-color-inverted);
  }

  .radius {
    border: 2px solid;
  }
}
</style>
