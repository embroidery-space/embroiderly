export const toast = {
  root: {
    width: "25rem",
    borderRadius: "{content.border.radius}",
    borderWidth: "1px",
    transitionDuration: "{transition.duration}",
  },
  icon: { size: "1.125rem" },
  content: { padding: "{overlay.popover.padding}", gap: "0.5rem" },
  text: { gap: "0.5rem" },
  summary: { fontWeight: "500", fontSize: "1rem" },
  detail: { fontWeight: "500", fontSize: "0.875rem" },
  closeButton: {
    width: "1.75rem",
    height: "1.75rem",
    borderRadius: "50%",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      offset: "{focus.ring.offset}",
    },
  },
  closeIcon: { size: "1rem" },
  colorScheme: {
    light: {
      root: { blur: "1.5px" },
      success: {
        background: "color-mix(in srgb, {success.50}, transparent 5%)",
        borderColor: "{success.200}",
        color: "{success.600}",
        detailColor: "{surface.700}",
        shadow: "0px 4px 8px 0px color-mix(in srgb, {success.500}, transparent 96%)",
        closeButton: {
          hoverBackground: "{success.100}",
          focusRing: {
            color: "{success.600}",
            shadow: "none",
          },
        },
      },
    },
    dark: {
      root: { blur: "10px" },
      success: {
        background: "color-mix(in srgb, {success.500}, transparent 84%)",
        borderColor: "color-mix(in srgb, {success.700}, transparent 64%)",
        color: "{success.500}",
        detailColor: "{surface.0}",
        shadow: "0px 4px 8px 0px color-mix(in srgb, {success.500}, transparent 96%)",
        closeButton: {
          hoverBackground: "rgba(255, 255, 255, 0.05)",
          focusRing: {
            color: "{success.500}",
            shadow: "none",
          },
        },
      },
    },
  },
};
