# Embroiderly UI Kit

A custom component library built specifically for the Embroiderly application.

## Why a Custom UI Kit?

We moved away from complete UI libraries like [PrimeVue](https://primevue.com) and [Nuxt UI](https://ui.nuxt.com) in favor of a custom solution.
While these libraries are excellent and served as inspiration, they come with trade-offs that didn't align with our needs:

- **Bundle size**: Full-featured UI libraries include many components and features we don't use.
- **Customization limits**: Achieving a desired look often requires fighting against the library's design system.
- **Dependency on external roadmaps**: Updates and breaking changes are outside of our control.

## Built on Reka UI

Our components are built on top of [Reka UI](https://reka-ui.com), which provides unstyled, primitive, and functional components with excellent accessibility out of the box.

Using Reka UI directly can be verbose, as it requires repeating the same composition and styling patterns across the application.
This UI Kit wraps Reka UI primitives into pre-styled, consistent components that:

- Follow our design system.
- Reduce boilerplate code.
- Ensure consistent behavior and accessibility.
- Are tailored to Embroiderly's specific needs.

## Nord Theme

The application uses the [Nord](https://www.nordtheme.com) color palette — a calm, arctic-inspired theme that provides excellent readability and a cohesive visual experience.

The design tokens showcased in this documentation reflect the Nord palette adapted for both light and dark modes.
