import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";

import ConfirmDialog from "./ConfirmDialog.vue";
import type { ConfirmDialogProps } from "./ConfirmDialog.vue";

describe("ConfirmDialog", () => {
  const props: ConfirmDialogProps = {
    open: true,
    portal: false,
    title: "Confirm",
    description: "Are you sure?",
  };

  test.each([
    ["with title and description", { props }],
    ["with yesButton hidden", { props: { ...props, yesButton: null } }],
    ["with noButton hidden", { props: { ...props, noButton: null } }],
    ["with class", { props: { ...props, class: "w-96" } }],
    ["with ui", { props: { ...props, ui: { footer: "justify-start" } } }],
  ] as [string, { props?: ConfirmDialogProps }][])("renders correctly %s", async (_, options) => {
    const screen = await page.render(ConfirmDialog, { ...options });
    expect(screen.container.outerHTML).toMatchSnapshot();
  });
});
