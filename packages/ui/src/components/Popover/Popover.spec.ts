import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { nextTick } from "vue";

import Popover from "./Popover.vue";
import type { PopoverProps } from "./Popover.vue";

describe("Popover", () => {
  const props: PopoverProps = { open: true, portal: false };

  test.each([
    ["with open", { props }],
    ["with arrow", { props: { ...props, arrow: true } }],
    ["with class", { props: { ...props, class: "shadow-xl" } }],
    ["with ui", { props: { ...props, ui: { content: "shadow-xl" } } }],
  ] as [string, { props?: PopoverProps }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(Popover, {
      ...options,
      slots: {
        default: () => "Trigger",
        content: () => "Content",
      },
    });
    await nextTick();

    expect(screen.container.outerHTML).toMatchSnapshot();
  });
});
