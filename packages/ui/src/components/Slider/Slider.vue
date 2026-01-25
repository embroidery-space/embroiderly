<script setup lang="ts">
  import type { SliderRootProps } from "reka-ui";
  import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from "reka-ui";
  import { computed } from "vue";

  import Tooltip from "../Tooltip/Tooltip.vue";
  import type { TooltipProps } from "../Tooltip/Tooltip.vue";

  import { SliderTheme } from "./Slider.theme.ts";
  import type { SliderThemeSlots, SliderThemeVariants } from "./Slider.theme.ts";

  export interface SliderProps extends Pick<
    SliderRootProps,
    "as" | "asChild" | "name" | "disabled" | "min" | "max" | "step"
  > {
    /**
     * The color scheme of the slider.
     * @default "primary"
     */
    color?: SliderThemeVariants["color"];
    /**
     * The size of the slider.
     * @default "md"
     */
    size?: SliderThemeVariants["size"];

    /**
     * Show tooltip on thumb with current value.
     * @default false
     */
    tooltip?: boolean | TooltipProps;

    class?: any;
    ui?: SliderThemeSlots;
  }

  export interface SliderEmits {
    "update:modelValue": [value: number];
    change: [event: Event];
  }

  const modelValue = defineModel<number>();
  const props = withDefaults(defineProps<SliderProps>(), {
    color: "primary",
    size: "md",
  });
  const emits = defineEmits<SliderEmits>();

  // Convert single value to array for Reka UI SliderRoot.
  const sliderValue = computed({
    get() {
      return modelValue.value === undefined ? undefined : [modelValue.value];
    },
    set(value) {
      if (value && value.length > 0) {
        modelValue.value = value[0];
      }
    },
  });

  const ui = computed(() => {
    return SliderTheme({
      color: props.color,
      size: props.size,
      disabled: props.disabled,
    });
  });

  function onChange(value: number[]) {
    // @ts-expect-error - `target` does not exist in type `EventInit`.
    const event = new Event("change", { target: { value: value[0] } });
    emits("change", event);
  }
</script>

<template>
  <SliderRoot
    v-model="sliderValue"
    :as="as"
    :as-child="asChild"
    :name="name"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
    @value-commit="onChange"
  >
    <SliderTrack :class="ui.track({ class: props.ui?.track })">
      <SliderRange :class="ui.range({ class: props.ui?.range })" />
    </SliderTrack>

    <Tooltip
      v-if="!!tooltip"
      disable-closing-trigger
      :text="String(modelValue ?? min)"
      v-bind="typeof tooltip === 'object' ? tooltip : {}"
    >
      <SliderThumb aria-label="Slider thumb" :class="ui.thumb({ class: props.ui?.thumb })" />
    </Tooltip>
    <SliderThumb v-else aria-label="Slider thumb" :class="ui.thumb({ class: props.ui?.thumb })" />
  </SliderRoot>
</template>
