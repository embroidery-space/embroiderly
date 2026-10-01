import { setProjectAnnotations } from "@storybook/vue3-vite";
import { vis, visAnnotations } from "storybook-addon-vis/vitest-setup";
import { beforeAll } from "vitest";

import * as previewAnnotations from "./preview.ts";

vis.setup({
  auto: {
    light() {
      document.documentElement.style.colorScheme = "light";
    },
    dark() {
      document.documentElement.style.colorScheme = "dark";
    },
  },
});

// Wires `!snapshot`/`snapshot` tags to storybook-addon-vis's auto-snapshot matcher.
// Storybook may suggest removing this call — don't: its own auto-provisioning doesn't include `visAnnotations`, so removing it silently disables tag-based snapshot control.
beforeAll(setProjectAnnotations([previewAnnotations, visAnnotations]).beforeAll);

// Wait for the Fixel font to finish loading so visual snapshots don't capture the fallback font.
beforeAll(() => document.fonts.ready);

beforeAll(() => {
  const style = document.createElement("style");
  style.innerHTML = `
    /* Freeze animations and transitions to keep visual snapshots deterministic. */
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
    }

    /* Shrink the captured area to the story content and add a small padding around it. */
    [data-vis-subject] {
      width: fit-content;
      padding: 1rem;
      background-color: var(--background-color-default);
    }
  `;

  document.head.append(style);
});
