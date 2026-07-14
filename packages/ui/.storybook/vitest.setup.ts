import { vis } from "storybook-addon-vis/vitest-setup";
import { beforeAll } from "vitest";

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
      background-color: var(--ui-bg);
    }
  `;

  document.head.append(style);
});
