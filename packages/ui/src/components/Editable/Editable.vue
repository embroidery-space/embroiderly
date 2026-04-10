<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { useForwardPropsEmits } from "reka-ui";
import type { EditableRootEmits, EditableRootProps } from "reka-ui";
import { Editable } from "reka-ui/namespaced";
import { computed } from "vue";

import { EditableTheme } from "./Editable.theme.ts";
import type { EditableThemeSlots } from "./Editable.theme.ts";

export interface EditableProps extends EditableRootProps {
  class?: any;
  ui?: EditableThemeSlots;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EditableEmits extends EditableRootEmits {}

const props = defineProps<EditableProps>();
const emits = defineEmits<EditableEmits>();

const rootProps = useForwardPropsEmits(reactiveOmit(props, "class", "ui"), emits);

const ui = computed(() => EditableTheme({ disabled: props.disabled }));
</script>

<template>
  <Editable.Root
    v-slot="{ isEditing, edit }"
    v-bind="rootProps"
    data-slot="root"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
  >
    <Editable.Area
      data-slot="area"
      :class="ui.area({ class: props.ui?.area })"
      @keydown.f2="if (props.activationMode === 'dblclick' && !isEditing) edit();"
    >
      <Editable.Preview data-slot="preview" :class="ui.preview({ class: props.ui?.preview })" />
      <!-- Stop keydown event propagation so parent components (e.g. Tree) don't intercept cursor movement and typing. -->
      <Editable.Input data-slot="input" :class="ui.input({ class: props.ui?.input })" @keydown.stop />
    </Editable.Area>
  </Editable.Root>
</template>
