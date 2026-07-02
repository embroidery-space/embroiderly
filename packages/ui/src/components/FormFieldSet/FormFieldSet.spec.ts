import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";

import FormFieldSet from "./FormFieldSet.vue";
import type { FormFieldSetProps } from "./FormFieldSet.vue";

describe("FormFieldSet", () => {
  const sizes = ["sm", "md", "lg"] as const;

  const props = { legend: "Legend" };

  test.each([
    ["with legend", { props }],
    ...sizes.map((size) => [`with size ${size}`, { props: { ...props, size } }]),
    ["with collapsible", { props: { ...props, collapsible: true } }],
    ["with class", { props: { ...props, class: "custom-class" } }],
    ["with ui", { props: { ...props, ui: { root: "rounded-lg" } } }],
  ] as [string, { props?: FormFieldSetProps }][])("renders correctly %s", async (_, options) => {
    const screen = await page.render(FormFieldSet, options);
    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  test("toggles open state when collapsible trigger is clicked", async () => {
    const screen = await page.render(FormFieldSet, {
      props: { ...props, collapsible: true },
      slots: { default: () => "Content" },
    });

    const trigger = screen.getByRole("button");
    const content = screen.getByText("Content");

    await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
    await expect.element(content).toBeInTheDocument();

    await userEvent.click(trigger);
    await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
    await expect.element(content).not.toBeInTheDocument();

    await userEvent.click(trigger);
    await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
    await expect.element(content).toBeInTheDocument();
  });
});
