import { computed, inject, toRef, toValue } from "vue";
import type { InjectionKey, MaybeRefOrGetter, Ref } from "vue";

import { DEFAULT_ICONS } from "../icons.ts";
import type { IconValue, Icons } from "../types/icons.ts";

export const iconsInjectionKey: InjectionKey<Ref<Icons | undefined>> = Symbol.for("embroiderly-ui.icons");

export interface UseComponentIconsProps {
  /** Display an icon based on the `leading` and `trailing` props. */
  icon?: IconValue;

  /** When `true`, the icon will be displayed on the left side. */
  leading?: boolean;
  /** Display an icon on the left side. */
  leadingIcon?: IconValue;

  /** When `true`, the icon will be displayed on the right side. */
  trailing?: boolean;
  /** Display an icon on the right side. */
  trailingIcon?: IconValue;

  /** When `true`, the loading icon will be displayed. */
  loading?: boolean;
  /**
   * The icon when the `loading` prop is `true`.
   * @default "icons.loading"
   */
  loadingIcon?: IconValue;
}

export function useComponentIcons(componentProps?: MaybeRefOrGetter<UseComponentIconsProps>) {
  const props = computed(() => (componentProps ? toValue(componentProps) : ({} as UseComponentIconsProps)));
  const icons = toRef(inject<Icons>(iconsInjectionKey, DEFAULT_ICONS));

  const isLeading = computed(
    () =>
      (props.value.icon && props.value.leading) ||
      (props.value.icon && !props.value.trailing) ||
      (props.value.loading && !props.value.trailing) ||
      !!props.value.leadingIcon,
  );

  const isTrailing = computed(
    () =>
      (props.value.icon && props.value.trailing) ||
      (props.value.loading && props.value.trailing) ||
      !!props.value.trailingIcon,
  );

  const leadingIconName = computed(() =>
    props.value.loading ? props.value.loadingIcon || icons.value.loading : props.value.leadingIcon || props.value.icon,
  );

  const trailingIconName = computed(() =>
    props.value.loading && !isLeading.value
      ? props.value.loadingIcon || icons.value.loading
      : props.value.trailingIcon || props.value.icon,
  );

  return {
    icons,
    isLeading,
    isTrailing,
    leadingIconName,
    trailingIconName,
  };
}
