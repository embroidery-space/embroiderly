import { computed, inject } from "vue";
import type { ComputedRef, InjectionKey } from "vue";

export const formFieldGroupInjectionKey: InjectionKey<ComputedRef<{ size?: "sm" | "md" | "lg" }>> = Symbol(
  "embroiderly-ui.form-field-group",
);

export function useFormFieldGroup() {
  const fieldGroup = inject(formFieldGroupInjectionKey, undefined);

  return {
    /** Whether the component is inside a `FormFieldGroup`. */
    fieldGroup: computed(() => !!fieldGroup),
    /** The size inherited from `FormFieldGroup` (or `undefined`). */
    fieldGroupSize: computed(() => fieldGroup?.value.size ?? "md"),
  };
}
