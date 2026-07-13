# Component Structure

Each component lives in its own folder: `packages/ui/src/components/ComponentName/`.

| File                      | Purpose                 |
| ------------------------- | ----------------------- |
| `ComponentName.vue`       | Source code             |
| `ComponentName.theme.ts`  | Tailwind Variants theme |
| `ComponentName.spec.ts`   | Vitest tests            |
| `ComponentName.story.vue` | Histoire story          |

## Reka UI Namespaced Components

Always import from `reka-ui/namespaced`, not flat:

```vue
<script setup lang="ts">
import { Switch, Label } from "reka-ui/namespaced";
import { Primitive } from "reka-ui";
</script>

<template>
  <Switch.Root>
    <Switch.Thumb />
  </Switch.Root>
</template>
```

## Props Interface Conventions

```ts
// Extend `PrimitiveProps` for wrapper components.
export interface ComponentProps extends PrimitiveProps { ... }

// Pick specific Reka props for form or interactive components.
export interface SliderProps extends Pick<SliderRootProps, "as" | "asChild" | "disabled" | "min" | "max" | "step"> { ... }

// Common props pattern. Always include `class` and `ui`.
export interface ComponentProps {
  color?: ComponentThemeVariants["color"];
  variant?: ComponentThemeVariants["variant"];
  size?: ComponentThemeVariants["size"];

  class?: any;
  ui?: ComponentThemeSlots;
}
```

## Data-Slot Attribute

All template elements that correspond to a theme slot must have the `data-slot` attribute matching the slot name.

```vue
<div data-slot="wrapper" :class="ui.wrapper()">
  <Icon data-slot="icon" :class="ui.icon()" />
  <span data-slot="label" :class="ui.label()">{{ label }}</span>
</div>
```

## Form Input Component

Form inputs use `useFormField` for ID and ARIA attributes, and `useFormFieldGroup` for group context.

```vue
<script setup lang="ts">
import { useFormField } from "../../composables/useFormField.ts";
import { useFormFieldGroup } from "../../composables/useFormFieldGroup.ts";

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<string>();

const { fieldGroup, fieldGroupSize } = useFormFieldGroup();
const { id, size: formFieldSize, ariaAttrs } = useFormField(props);
const size = computed(() => props.size ?? fieldGroupSize.value ?? formFieldSize.value);

const ui = computed(() => ComponentTheme({ size: size.value, fieldGroup: fieldGroup.value }));
</script>

<template>
  <!-- Spread $attrs and ariaAttrs on the actual input, not the wrapper -->
  <input
    :id="id"
    v-bind="{ ...$attrs, ...ariaAttrs }"
    data-slot="base"
    :class="ui.base({ class: [props.ui?.base, props.class] })"
  />
</template>
```

## Forwarding Reka Props & Emits

Use `reactivePick` + `useForwardPropsEmits` to forward only the relevant Reka props:

```vue
<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { useForwardPropsEmits } from "reka-ui";

const rootProps = useForwardPropsEmits(reactivePick(props, "open", "defaultOpen", "modal"), emits);
</script>

<template>
  <Popover.Root v-bind="rootProps">...</Popover.Root>
</template>
```

## Overlay/Portal Components

Components with floating content use `usePortal`:

```vue
<script setup lang="ts">
import { usePortal } from "../../composables/usePortal.ts";
import defu from "defu";

const portalProps = usePortal(toRef(() => props.portal));
const contentProps = computed(
  () => defu(props.content, { side: "bottom", sideOffset: 8, collisionPadding: 8 }) as PopoverContentProps,
);
</script>

<template>
  <Popover.Portal v-bind="portalProps">
    <Popover.Content v-bind="contentProps" data-slot="content" :class="ui.content(...)">
      <slot name="content" />
    </Popover.Content>
  </Popover.Portal>
</template>
```

Default `portal` prop is `true` (renders to `<body>`).

## Components with Icons

```vue
<script setup lang="ts">
import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import Icon from "../Icon/Icon.vue";

// Pass props reactively so loading state re-computes icon placement:
const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(
  computed(() => ({ ...props, loading: isLoading.value })),
);

// For static icons access.
const { icons } = useComponentIcons();
</script>

<template>
  <Icon
    v-if="isLeading && leadingIconName"
    aria-hidden="true"
    :name="leadingIconName"
    data-slot="leadingIcon"
    :class="ui.leadingIcon()"
  />
</template>
```

## Slot Typed Components

All components must explicitly define their slots using `defineSlots()` macro.
When checking if a slot is provided in the template, use the `slots` variable from `defineSlots()` instead of the ephemeral `$slots` object:

```vue
<script setup lang="ts">
export interface ComponentSlots {
  default(): any;
  header(props: { isOpen: boolean }): any;
}

const props = defineProps<ComponentProps>();
const slots = defineSlots<ComponentSlots>();
</script>

<template>
  <header v-if="!!slots.header">
    <slot name="header" />
  </header>
</template>
```

## Generic Item Types

Components with an `items` prop are generic over the item type:

```vue
<script setup lang="ts" generic="T extends TabsItem">
export interface TabsProps<T extends TabsItem = TabsItem> {
  items?: T[];
}

export interface TabsSlots<T extends TabsItem = TabsItem> {
  default(props: { item: T; index: number }): any;
}

const props = defineProps<TabsProps<T>>();
const slots = defineSlots<TabsSlots<T>>();
</script>
```

## I18n

For accessible labels on interactive elements:

```vue
<script setup lang="ts">
import { useLocale } from "../../composables/useLocale.ts";

const { t } = useLocale();
</script>

<template>
  <button :aria-label="t('inputNumber.increment')" />
</template>
```
