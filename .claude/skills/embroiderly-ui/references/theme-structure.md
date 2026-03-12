# Theme Structure

Themes live in `packages/ui/src/components/ComponentName/ComponentName.theme.ts`.
Not every component has a theme---composite wrappers delegate to child component themes.

## Writing Classes

Write all Tailwind CSS classes on a single line in a single string.
Never manually break lines---let the linter handle it.

## Standard Multi-Slot Theme

```ts
import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const ComponentTheme = tv({
  slots: {
    root: "",
    base: "",
    label: "",
    leadingIcon: "",
    trailingIcon: "",
  },
  variants: {
    color: {
      primary: {}, // empty object = no base class, only via compoundVariants
      neutral: {},
    },
    variant: {
      solid: {},
      outline: {
        base: "",
      },
    },
    size: {
      sm: {
        base: "",
        leadingIcon: "",
      },
      md: {
        base: "",
        leadingIcon: "",
      },
      lg: {
        base: "",
        leadingIcon: "",
      },
    },

    // Boolean variants:
    disabled: {
      true: {
        root: "",
      },
    },
    loading: { true: {} },
    square: { true: {} },
    leading: { true: {} },
    trailing: { true: {} },

    // Context variants:
    fieldGroup: {
      true: {
        base: "",
      },
    },
  },
  compoundVariants: [
    // color × variant combinations:
    {
      color: "primary",
      variant: "solid",
      class: { base: "" },
    },
    {
      color: "neutral",
      variant: "outline",
      class: { base: "" },
    },

    // size × boolean combinations:
    { square: true, size: "sm", class: { base: "" } },
    { square: true, size: "md", class: { base: "" } },

    // loading state:
    {
      loading: true,
      leading: true,
      class: { leadingIcon: "animate-spin" },
    },
    {
      loading: true,
      leading: false,
      trailing: true,
      class: { trailingIcon: "animate-spin" },
    },
  ],
  // No default variants in the theme. All defaults go in `withDefaults` in the component.
});

export type ComponentThemeVariants = VariantProps<typeof ComponentTheme>;
export type ComponentThemeSlots = Partial<(typeof ComponentTheme)["slots"]>;
```

## Using the Theme in a Component

```ts
// Always in computed when there are variants:
const ui = computed(() =>
  ComponentTheme({
    color: props.color,
    variant: props.variant,
    size: size.value,
    disabled: props.disabled,
    fieldGroup: fieldGroup.value,
  }),
);
```

Apply in template:

```vue
<div :class="ui.root({ class: [props.ui?.root, props.class] })">
  <div :class="ui.base({ class: props.ui?.base })"></div>
</div>
```

## Semantic Colors

Never use raw Tailwind palette colors (e.g., `bg-blue-500`).

Available colors: `primary`, `error`, `warning`, `success`, `info`, `help`, `neutral`.

### Text

- `text-default` - Primary text.
- `text-muted` - Secondary text.
- `text-dimmed` - Placeholder text.
- `text-inverted` - Text on dark/filled backgrounds.

### Background

- `bg-default` - Page/panel background.
- `bg-elevated` - Cards, dropdowns.
- `bg-accented` - Hover states, slider track.
- `bg-inverted` - Dark/filled elements.

### Border / Ring

- `border-default` - Standard border.
- `border-elevated` - Elevated border.
- `border-accented` - Accented border.
- `ring-default` - Focus ring.
- `ring-accented` - Emphasized ring.
