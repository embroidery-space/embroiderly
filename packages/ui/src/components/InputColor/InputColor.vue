<script setup lang="ts">
  import { computed } from "vue";

  import Button from "../Button/Button.vue";
  import ColorPicker from "../ColorPicker/ColorPicker.vue";
  import type { ColorPickerProps } from "../ColorPicker/ColorPicker.vue";
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
  const props = withDefaults(defineProps<InputColorProps>(), {
    size: "lg",
  });

  const hexColor = computed(() => (modelValue.value?.startsWith("#") ? modelValue.value : `#${modelValue.value}`));

  function onUpdate(value: string | undefined) {
    if (value && value.startsWith("#")) {
      modelValue.value = value.slice(1);
    }
  }
</script>

<template>
  <Input v-bind="{ ...props, ...$attrs }" :model-value="hexColor" :maxlength="7" @update:model-value="onUpdate">
    <template #leading>
      <Popover v-bind="popover" :content="{ sideOffset: 12 }" class="p-4">
        <Button
          square
          :size="size"
          :disabled="disabled"
          :style="{ backgroundColor: hexColor }"
          :class="{
            'rounded-xs': size === 'sm',
            'rounded-sm': size === 'md',
            'rounded-md': size === 'lg',
          }"
        />
        <template #content>
          <ColorPicker
            v-bind="picker"
            :model-value="hexColor"
            :size="size"
            :disabled="disabled"
            @update:model-value="onUpdate"
          />
        </template>
      </Popover>
    </template>
  </Input>
</template>
