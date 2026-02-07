<script setup lang="ts">
  import { Label, Primitive } from "reka-ui";
  import type { PrimitiveProps } from "reka-ui";
  import { computed, provide, ref, useId } from "vue";

  import { formFieldInjectionKey, inputIdInjectionKey } from "../../composables/useFormField.ts";
  import type { FormFieldInjectedOptions } from "../../composables/useFormField.ts";

  import { FormFieldTheme } from "./FormField.theme.ts";
  import type { FormFieldThemeSlots, FormFieldThemeVariants } from "./FormField.theme.ts";

  export interface FormFieldProps extends PrimitiveProps {
    /** The label text for the field. */
    label?: string;
    /** A description shown below the label. */
    description?: string;
    /** Help text shown below the input. */
    help?: string;
    /** A hint shown next to the label. */
    hint?: string;

    /**
     * The size of the form field.
     * @default "lg"
     */
    size?: FormFieldThemeVariants["size"];

    class?: any;
    ui?: FormFieldThemeSlots;
  }

  const props = withDefaults(defineProps<FormFieldProps>(), {
    as: "div",

    size: "lg",
  });

  const id = ref(useId());
  const ariaId = id.value;

  provide(inputIdInjectionKey, id);
  provide(
    formFieldInjectionKey,
    computed(
      () =>
        ({
          ariaId,
          label: props.label,
          size: props.size,
          hint: props.hint,
          description: props.description,
          help: props.help,
        }) satisfies FormFieldInjectedOptions,
    ),
  );

  const ui = computed(() => {
    return FormFieldTheme({
      size: props.size,
    });
  });
</script>

<template>
  <Primitive :as="as" :as-child="asChild" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <div :class="ui.wrapper({ class: props.ui?.wrapper })">
      <div v-if="label" :class="ui.labelWrapper({ class: props.ui?.labelWrapper })">
        <Label :id="`${ariaId}-label`" :for="id" :class="ui.label({ class: props.ui?.label })">
          {{ label }}
        </Label>
        <span v-if="hint" :id="`${ariaId}-hint`" :class="ui.hint({ class: props.ui?.hint })">
          {{ hint }}
        </span>
      </div>

      <p v-if="description" :id="`${ariaId}-description`" :class="ui.description({ class: props.ui?.description })">
        {{ description }}
      </p>
    </div>

    <div :class="[(label || description) && ui.container({ class: props.ui?.container })]">
      <slot />
      <p v-if="help" :id="`${ariaId}-help`" :class="ui.help({ class: props.ui?.help })">
        {{ help }}
      </p>
    </div>
  </Primitive>
</template>
