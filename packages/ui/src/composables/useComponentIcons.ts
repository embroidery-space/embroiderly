import type { MaybeRefOrGetter } from "vue";
import { computed, toValue } from "vue";

export const DEFAULT_LOADING_ICON = "lucide:loader-circle";

export interface UseComponentIconsProps {
  /** Display an icon based on the `leading` and `trailing` props. */
  icon?: string;

  /** When `true`, the icon will be displayed on the left side. */
  leading?: boolean;
  /** Display an icon on the left side. */
  leadingIcon?: string;

  /** When `true`, the icon will be displayed on the right side. */
  trailing?: boolean;
  /** Display an icon on the right side. */
  trailingIcon?: string;

  /** When `true`, the loading icon will be displayed. */
  loading?: boolean;
  /**
   * The icon when the `loading` prop is `true`.
   * @default "lucide:loader-circle"
   */
  loadingIcon?: string;
}

export function useComponentIcons(componentProps: MaybeRefOrGetter<UseComponentIconsProps>) {
  const props = computed(() => toValue(componentProps));

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
    props.value.loading ? props.value.loadingIcon || DEFAULT_LOADING_ICON : props.value.leadingIcon || props.value.icon,
  );

  const trailingIconName = computed(() =>
    props.value.loading && !isLeading.value
      ? props.value.loadingIcon || DEFAULT_LOADING_ICON
      : props.value.trailingIcon || props.value.icon,
  );

  return {
    isLeading,
    isTrailing,
    leadingIconName,
    trailingIconName,
  };
}
