import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { nextTick } from "vue";

import Editable from "./Editable.vue";
import type { EditableProps } from "./Editable.vue";

describe("Editable", () => {
  test.each([
    ["default", { props: { defaultValue: "Hello" } }],
    ["with disabled", { props: { defaultValue: "Hello", disabled: true } }],
    ["with placeholder", { props: { placeholder: "Enter text..." } }],
    ["with autoResize", { props: { defaultValue: "Hello", autoResize: true } }],
    ["with class", { props: { defaultValue: "Hello", class: "select-none" } }],
    ["with ui", { props: { defaultValue: "Hello", ui: { preview: "text-red-500" } } }],
  ] as [string, { props?: EditableProps }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(Editable, options);
    await nextTick();

    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  test("activates editing on F2 when activationMode is dblclick", async () => {
    const screen = page.render(Editable, {
      props: { defaultValue: "Hello", activationMode: "dblclick" },
    });
    await nextTick();

    await userEvent.click(screen.getByText("Hello"));
    await nextTick();

    await userEvent.keyboard("{F2}");
    await nextTick();

    await expect.element(screen.getByRole("textbox")).toBeVisible();
  });
});
