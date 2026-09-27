<script setup lang="ts">
import { useForwardPropsEmits } from "reka-ui";
import type { EditableRootEmits, EditableRootProps } from "reka-ui";
import { Editable } from "reka-ui/namespaced";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EditableProps extends EditableRootProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EditableEmits extends EditableRootEmits {}

const props = defineProps<EditableProps>();
const emit = defineEmits<EditableEmits>();

const rootProps = useForwardPropsEmits(props, emit);
</script>

<template>
  <Editable.Root
    v-slot="{ isEditing, edit }"
    v-bind="rootProps"
    data-slot="root"
    :class="[$style.root, { [$style.disabled]: disabled }]"
  >
    <Editable.Area
      data-slot="area"
      :class="$style.area"
      @keydown.f2="if (props.activationMode === 'dblclick' && !isEditing) edit();"
    >
      <Editable.Preview data-slot="preview" :class="$style.preview" />
      <!-- Stop keydown event propagation so parent components (e.g. Tree) don't intercept cursor movement and typing. -->
      <Editable.Input data-slot="input" :class="$style.input" @keydown.stop />
    </Editable.Area>
  </Editable.Root>
</template>

<style module>
.root {
  display: inline-flex;
}

.area {
  position: relative;

  display: inline-flex;
  align-items: center;

  width: fit-content;
  min-width: 0;

  color: var(--text-color-default);

  &:not([data-placeholder-shown]) {
    width: 100%;
  }

  &[data-empty] {
    color: var(--text-color-dimmed);
  }

  .disabled > & {
    cursor: not-allowed;
    opacity: 50%;
  }
}

.preview {
  cursor: text;

  overflow: hidden;
  display: block;

  min-width: 0;

  color: inherit;
  text-overflow: ellipsis;
  white-space: nowrap;

  outline-style: none;
}

.input {
  display: block;

  width: 100%;
  max-width: 100%;

  color: inherit;

  background-color: transparent;
  outline-style: none;

  &::placeholder {
    color: var(--text-color-dimmed);
  }
}
</style>
