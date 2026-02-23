import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { nextTick } from "vue";

import Dialog from "./Dialog.vue";
import type { DialogProps } from "./Dialog.vue";

describe("Dialog", () => {
  const props: DialogProps = { open: true, portal: false, title: "Dialog" };

  test.each([
    ["with title", { props }],
    ["with description", { props: { ...props, description: "Are you sure?" } }],
    ["with non-dismissible", { props: { ...props, dismissible: false } }],
    ["with class", { props: { ...props, class: "w-96" } }],
    ["with ui", { props: { ...props, ui: { footer: "justify-start" } } }],
  ] as [string, { props?: DialogProps }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(Dialog, {
      ...options,
      slots: {
        default: () => "Open Dialog",
        body: () => "Dialog body content",
        footer: () => "Footer content",
      },
    });
    await nextTick();

    expect(screen.container.outerHTML).toMatchSnapshot();
  });
});
