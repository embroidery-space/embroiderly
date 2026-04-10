import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { h } from "vue";

import Popover from "./Popover.vue";

type PopoverProps = InstanceType<typeof Popover>["$props"];

describe("Popover", () => {
  const props: PopoverProps = { open: true, portal: false };

  test.each([
    ["with open", { props }],
    ["with arrow", { props: { ...props, arrow: true } }],
    ["with class", { props: { ...props, class: "shadow-xl" } }],
    ["with ui", { props: { ...props, ui: { content: "shadow-xl" } } }],
  ] as [string, { props?: PopoverProps }][])("renders correctly %s", async (_, options) => {
    const screen = await page.render(Popover, {
      ...options,
      slots: {
        default: () => "Trigger",
        content: () => "Content",
      },
    });
    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  describe("pinned behavior", () => {
    test("default popover closes when clicking outside", async () => {
      const screen = await page.render(Popover, {
        props,
        slots: {
          default: () => h("button", "Trigger"),
          content: () => "Content",
        },
      });

      await userEvent.click(document.body);

      await expect.element(screen.getByText("Content")).not.toBeInTheDocument();
    });

    test("pinned popover stays open when clicking outside", async () => {
      const screen = await page.render(Popover, {
        props: { ...props, pinned: true },
        slots: {
          default: () => h("button", "Trigger"),
          content: () => "Content",
        },
      });

      await userEvent.click(document.body);

      await expect.element(screen.getByText("Content")).toBeInTheDocument();
    });
  });
});
