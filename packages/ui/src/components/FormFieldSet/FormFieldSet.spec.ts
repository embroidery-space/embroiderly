import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { nextTick } from "vue";

import FormFieldSet from "./FormFieldSet.vue";
import type { FormFieldSetProps } from "./FormFieldSet.vue";

describe("FormFieldSet", () => {
  const sizes = ["sm", "md", "lg"] as const;

  const props = { legend: "Legend" };

  test.each([
    ["with legend", { props }],
    ...sizes.map((size) => [`with size ${size}`, { props: { ...props, size } }]),
    ["with class", { props: { ...props, class: "custom-class" } }],
    ["with ui", { props: { ...props, ui: { root: "rounded-lg" } } }],
  ] as [string, { props?: FormFieldSetProps }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(FormFieldSet, options);
    await nextTick();

    expect(screen.container).toMatchSnapshot();
  });
});
