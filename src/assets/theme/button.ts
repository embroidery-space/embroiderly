export const button = {
  root: {
    iconOnlyWidth: "2.5rem",
    borderRadius: "{form.field.border.radius}",
    roundedBorderRadius: "2rem",
    gap: "0.5rem",
    paddingX: "{form.field.padding.x}",
    paddingY: "{form.field.padding.y}",
    sm: {
      fontSize: "{form.field.sm.font.size}",
      paddingX: "{form.field.sm.padding.x}",
      paddingY: "{form.field.sm.padding.y}",
    },
    lg: {
      fontSize: "{form.field.lg.font.size}",
      paddingX: "{form.field.lg.padding.x}",
      paddingY: "{form.field.lg.padding.y}",
    },
    label: { fontWeight: "400" },
    raisedShadow: "0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12)",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      offset: "{focus.ring.offset}",
    },
    badgeSize: "1rem",
    transitionDuration: "{form.field.transition.duration}",
  },
  primary: {
    background: "{primary.color}",
    hoverBackground: "{primary.hover.color}",
    activeBackground: "{primary.active.color}",
    borderColor: "{primary.color}",
    hoverBorderColor: "{primary.hover.color}",
    activeBorderColor: "{primary.active.color}",
    hoverColor: "{button.primary.color}",
    activeColor: "{button.primary.color}",
    focusRing: { color: "{primary.color}", shadow: "none" },
  },
  info: {
    background: "{info.color}",
    hoverBackground: "{info.hover.color}",
    activeBackground: "{info.active.color}",
    borderColor: "{info.color}",
    hoverBorderColor: "{info.hover.color}",
    activeBorderColor: "{info.active.color}",
    hoverColor: "{button.info.color}",
    activeColor: "{button.info.color}",
    focusRing: { color: "{info.color}", shadow: "none" },
  },
  success: {
    background: "{success.color}",
    hoverBackground: "{success.hover.color}",
    activeBackground: "{success.active.color}",
    borderColor: "{success.color}",
    hoverBorderColor: "{success.hover.color}",
    activeBorderColor: "{success.active.color}",
    hoverColor: "{button.success.color}",
    activeColor: "{button.success.color}",
    focusRing: { color: "{success.color}", shadow: "none" },
  },
  warn: {
    background: "{warn.color}",
    hoverBackground: "{warn.hover.color}",
    activeBackground: "{warn.active.color}",
    borderColor: "{warn.color}",
    hoverBorderColor: "{warn.hover.color}",
    activeBorderColor: "{warn.active.color}",
    hoverColor: "{button.warn.color}",
    activeColor: "{button.warn.color}",
    focusRing: { color: "{warn.color}", shadow: "none" },
  },
  help: {
    background: "{help.color}",
    hoverBackground: "{help.hover.color}",
    activeBackground: "{help.active.color}",
    borderColor: "{help.color}",
    hoverBorderColor: "{help.hover.color}",
    activeBorderColor: "{help.active.color}",
    hoverColor: "{button.help.color}",
    activeColor: "{button.help.color}",
    focusRing: { color: "{help.color}", shadow: "none" },
  },
  danger: {
    background: "{danger.color}",
    hoverBackground: "{danger.hover.color}",
    activeBackground: "{danger.active.color}",
    borderColor: "{danger.color}",
    hoverBorderColor: "{danger.hover.color}",
    activeBorderColor: "{danger.active.color}",
    color: "{danger.contrast.color}",
    hoverColor: "{button.danger.color}",
    activeColor: "{button.danger.color}",
    focusRing: { color: "{danger.color}", shadow: "none" },
  },
  contrast: {
    background: "{text.color}",
    hoverBackground: "{text.hover.color}",
    activeBackground: "{text.active.color}",
    borderColor: "{text.color}",
    hoverBorderColor: "{text.hover.color}",
    activeBorderColor: "{text.active.color}",
    color: "{text.contrast.color}",
    hoverColor: "{text.contrast.color}",
    activeColor: "{text.contrast.color}",
    focusRing: { color: "{text.color}", shadow: "none" },
  },
  outlined: {
    primary: {
      color: "{primary.color}",
      borderColor: "{primary.color}",
      hoverBackground: "color-mix(in srgb, {primary.color}, transparent 92%)",
      activeBackground: "color-mix(in srgb, {primary.color}, transparent 84%)",
    },
    secondary: {
      color: "{text.color}",
      borderColor: "{text.color}",
      hoverBackground: "color-mix(in srgb, {text.color}, transparent 92%)",
      activeBackground: "color-mix(in srgb, {text.color}, transparent 84%)",
    },
    success: {
      color: "{success.color}",
      borderColor: "{success.color}",
      hoverBackground: "color-mix(in srgb, {success.color}, transparent 92%)",
      activeBackground: "color-mix(in srgb, {success.color}, transparent 84%)",
    },
    info: {
      color: "{info.color}",
      borderColor: "{info.color}",
      hoverBackground: "color-mix(in srgb, {info.color}, transparent 92%)",
      activeBackground: "color-mix(in srgb, {info.color}, transparent 84%)",
    },
    warn: {
      color: "{warn.color}",
      borderColor: "{warn.color}",
      hoverBackground: "color-mix(in srgb, {warn.color}, transparent 92%)",
      activeBackground: "color-mix(in srgb, {warn.color}, transparent 84%)",
    },
    help: {
      color: "{help.color}",
      borderColor: "{help.color}",
      hoverBackground: "color-mix(in srgb, {help.color}, transparent 92%)",
      activeBackground: "color-mix(in srgb, {help.color}, transparent 84%)",
    },
    danger: {
      color: "{danger.color}",
      borderColor: "{danger.color}",
      hoverBackground: "color-mix(in srgb, {danger.color}, transparent 92%)",
      activeBackground: "color-mix(in srgb, {danger.color}, transparent 84%)",
    },
    contrast: {
      color: "{text.color}",
      borderColor: "{text.color}",
      hoverBackground: "color-mix(in srgb, {text.color}, transparent 92%)",
      activeBackground: "color-mix(in srgb, {text.color}, transparent 84%)",
    },
  },
  text: {
    primary: {
      color: "{primary.color}",
      hoverBackground: "color-mix(in srgb, {primary.color}, transparent 92%)",
      activeBackground: "color-mix(in srgb, {primary.color}, transparent 84%)",
    },
    secondary: {
      color: "{text.color}",
      hoverBackground: "color-mix(in srgb, {text.color}, transparent 92%)",
      activeBackground: "color-mix(in srgb, {text.color}, transparent 84%)",
    },
    success: {
      color: "{success.color}",
      hoverBackground: "color-mix(in srgb, {success.color}, transparent 92%)",
      activeBackground: "color-mix(in srgb, {success.color}, transparent 84%)",
    },
    info: {
      color: "{info.color}",
      hoverBackground: "color-mix(in srgb, {info.color}, transparent 92%)",
      activeBackground: "color-mix(in srgb, {info.color}, transparent 84%)",
    },
    warn: {
      color: "{warn.color}",
      hoverBackground: "color-mix(in srgb, {warn.color}, transparent 92%)",
      activeBackground: "color-mix(in srgb, {warn.color}, transparent 84%)",
    },
    help: {
      color: "{help.color}",
      hoverBackground: "color-mix(in srgb, {help.color}, transparent 92%)",
      activeBackground: "color-mix(in srgb, {help.color}, transparent 84%)",
    },
    danger: {
      color: "{danger.color}",
      hoverBackground: "color-mix(in srgb, {danger.color}, transparent 92%)",
      activeBackground: "color-mix(in srgb, {danger.color}, transparent 84%)",
    },
    contrast: {
      color: "{text.color}",
      hoverBackground: "color-mix(in srgb, {text.color}, transparent 92%)",
      activeBackground: "color-mix(in srgb, {text.color}, transparent 84%)",
    },
  },
  link: {
    color: "{primary.color}",
    hoverColor: "{primary.hover.color}",
    activeColor: "{primary.active.color}",
  },
  colorScheme: {
    light: {
      root: {
        primary: { color: "{text.color}" },
        info: { color: "{text.color}" },
        success: { color: "{text.color}" },
        warn: { color: "{text.color}" },
        help: { color: "{text.color}" },
        danger: { color: "{text.color}" },
        secondary: {
          background: "{surface.600}",
          hoverBackground: "{surface.700}",
          activeBackground: "{surface.800}",
          borderColor: "{surface.600}",
          hoverBorderColor: "{surface.700}",
          activeBorderColor: "{surface.800}",
          color: "{text.color}",
          hoverColor: "{text.color}",
          activeColor: "{text.color}",
          focusRing: { color: "{surface.600}", shadow: "none" },
        },
      },
    },
    dark: {
      root: {
        primary: { color: "{primary.contrast.color}" },
        info: { color: "{info.contrast.color}" },
        success: { color: "{success.contrast.color}" },
        warn: { color: "{warn.contrast.color}" },
        help: { color: "{help.contrast.color}" },
        danger: { color: "{danger.contrast.color}" },
        secondary: {
          background: "{surface.600}",
          hoverBackground: "{surface.500}",
          activeBackground: "{surface.400}",
          borderColor: "{surface.600}",
          hoverBorderColor: "{surface.500}",
          activeBorderColor: "{surface.400}",
          color: "{text.color}",
          hoverColor: "{text.color}",
          activeColor: "{text.color}",
          focusRing: { color: "{surface.600}", shadow: "none" },
        },
      },
    },
  },
};
