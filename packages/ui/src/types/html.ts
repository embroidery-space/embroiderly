import type { InputHTMLAttributes as VueInputHTMLAttributes } from "vue";

export type InputHTMLAttributes = Pick<
  VueInputHTMLAttributes,
  "autocomplete" | "autofocus" | "disabled" | "maxlength" | "minlength" | "name" | "placeholder" | "readonly"
>;
