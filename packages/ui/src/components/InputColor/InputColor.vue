<script setup lang="ts">
import { computed } from "vue";

import Button from "../Button/Button.vue";
import ColorPicker from "../ColorPicker/ColorPicker.vue";
import type { ColorPickerProps } from "../ColorPicker/ColorPicker.vue";
import FormFieldGroup from "../FormFieldGroup/FormFieldGroup.vue";
import Input from "../Input/Input.vue";
import type { InputProps } from "../Input/Input.vue";
import Popover from "../Popover/Popover.vue";
import type { PopoverProps } from "../Popover/Popover.vue";

export interface InputColorProps extends InputProps {
  /** Props to pass to the popover component. */
  popover?: Partial<PopoverProps>;
  /** Props to pass to the color picker component. */
  picker?: Partial<ColorPickerProps>;
}

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<string>({ default: "#FF0000" });
const props = defineProps<InputColorProps>();

const hexColor = computed(() => (modelValue.value?.startsWith("#") ? modelValue.value : `#${modelValue.value}`));

function onUpdate(value: string | undefined) {
  if (value && value.startsWith("#")) {
    modelValue.value = value.slice(1);
  }
}
</script>

<template>
  <FormFieldGroup>
    <Popover v-bind="popover" :content="{ align: 'start' }">
      <Button square :disabled="disabled" :style="{ backgroundColor: hexColor }" :class="[$style.swatch]" />
      <template #content>
        <ColorPicker
          v-bind="picker"
          :class="$style.picker"
          :model-value="hexColor"
          :disabled="disabled"
          @update:model-value="onUpdate"
        />
      </template>
    </Popover>

    <Input v-bind="{ ...props, ...$attrs }" :model-value="hexColor" :maxlength="7" @update:model-value="onUpdate" />
  </FormFieldGroup>
</template>

<style module>
.swatch {
  width: calc(var(--spacing) * 8);
  height: calc(var(--spacing) * 8);
}

.picker {
  padding: calc(var(--spacing) * 4);
}
</style>
