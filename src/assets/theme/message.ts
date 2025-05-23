export const message = {
  root: {
    borderWidth: "1px",
    borderRadius: "{content.border.radius}",
    transitionDuration: "{transition.duration}",
  },
  content: {
    padding: "0.5rem 0.75rem",
    gap: "0.5rem",
    sm: { padding: "0.375rem 0.625rem" },
    lg: { padding: "0.625rem 0.875rem" },
  },
  text: {
    fontSize: "1rem",
    fontWeight: "400",
    sm: { fontSize: "0.875rem" },
    lg: { fontSize: "1.125rem" },
  },
  outlined: { root: { borderWidth: "1px" } },
  simple: { content: { padding: "0" } },
  shadow: "0px 4px 8px 0px color-mix(in srgb, {surface.500}, transparent 96%)",
  colorScheme: {
    light: {
      secondary: {
        background: "{surface.100}",
        borderColor: "{surface.200}",
        color: "{surface.600}",
        outlined: { color: "{text.muted.color}", borderColor: "{text.muted.color}" },
        simple: { color: "{text.muted.color}" },
      },
    },
    dark: {
      secondary: {
        background: "{surface.800}",
        borderColor: "{surface.700}",
        color: "{surface.300}",
        outlined: { color: "{surface.300}", borderColor: "{surface.400}" },
        simple: { color: "{surface.300}" },
      },
    },
  },
};
