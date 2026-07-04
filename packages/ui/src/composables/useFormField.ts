import { computed, inject, provide, useId } from "vue";
import type { ComputedRef, InjectionKey, Ref } from "vue";

export interface FormFieldInjectedOptions {
  ariaId: string;

  label?: string;
  size?: "sm" | "md" | "lg";

  description?: string;
  help?: string;
  hint?: string;
}

interface UseFormFieldProps {
  id?: string;
  size?: "sm" | "md" | "lg";
}

export const inputIdInjectionKey: InjectionKey<Ref<string | undefined> | undefined> = Symbol("embroiderly-ui.input-id");
export const formFieldInjectionKey: InjectionKey<ComputedRef<FormFieldInjectedOptions> | undefined> =
  Symbol("embroiderly-ui.form-field");

export function useFormField(props?: UseFormFieldProps) {
  const formField = inject(formFieldInjectionKey, undefined);
  const inputId = inject(inputIdInjectionKey, undefined);

  // Block nested injections to prevent duplicated context in nested inputs.
  provide(formFieldInjectionKey, undefined);
  provide(inputIdInjectionKey, undefined);

  // Update input ID if a custom id is provided via props.
  if (formField && inputId && props?.id) inputId.value = props.id;

  const id = computed(() => props?.id ?? inputId?.value ?? useId());

  const label = computed(() => formField?.value?.label);
  const size = computed(() => props?.size ?? formField?.value?.size ?? "md");

  /** Builds `aria-describedby` ID parts from the `FormField` context. */
  function describedByParts() {
    if (!formField?.value) return [];

    const parts: string[] = [];
    if (formField.value.hint) parts.push(`${formField.value.ariaId}-hint`);
    if (formField.value.description) parts.push(`${formField.value.ariaId}-description`);
    if (formField.value.help) parts.push(`${formField.value.ariaId}-help`);

    return parts;
  }

  const ariaAttrs = computed(() => {
    const parts = describedByParts();
    return parts.length > 0 ? { "aria-describedby": parts.join(" ") } : {};
  });

  const groupAttrs = computed(() => {
    if (!formField?.value) return {};

    const attrs: Record<string, string> = { role: "group" };
    if (formField.value.label) attrs["aria-labelledby"] = `${formField.value.ariaId}-label`;

    const parts = describedByParts();
    if (parts.length > 0) attrs["aria-describedby"] = parts.join(" ");

    return attrs;
  });

  return {
    /** The ID to use for the input element. */
    id,
    /** The label text for the input element. */
    label,
    /** The size inherited from FormField, prop, or default. */
    size,
    /** ARIA attributes for accessibility. */
    ariaAttrs,
    /** ARIA attributes for composite input wrappers (e.g. InputNumberSlider). */
    groupAttrs,
  };
}
