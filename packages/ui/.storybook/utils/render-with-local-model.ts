import { ref } from "vue";
import type { Component } from "vue";

/**
 * Storybook never writes `update:modelValue` back into `args`.
 * A story that passes both `modelValue` and an `onUpdate:modelValue` spy renders a fully controlled component that never visually changes.
 * The spy still fires, but the story's baseline would capture the state *before* the interaction.
 * Binding a local model on top keeps the spy (handlers are merged, not overwritten) while letting the rendered value follow the interaction.
 */
export function renderWithLocalModel<T extends { modelValue?: unknown }>(component: Component, tag: string) {
  return (args: T) => ({
    components: { [tag]: component },
    setup: () => ({ args, value: ref(args.modelValue) }),
    template: `<${tag} v-bind="args" v-model="value" />`,
  });
}
