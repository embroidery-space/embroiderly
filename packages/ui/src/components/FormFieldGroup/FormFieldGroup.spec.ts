/* eslint-disable vue/one-component-per-file */

import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { defineComponent, nextTick } from "vue";

import Button from "../Button/Button.vue";
import Input from "../Input/Input.vue";
import InputNumber from "../InputNumber/InputNumber.vue";

import FormFieldGroup from "./FormFieldGroup.vue";
import type { FormFieldGroupProps } from "./FormFieldGroup.vue";

describe("FormFieldGroup", () => {
  const sizes = ["sm", "md", "lg"] as const;

  test.each([
    ...sizes.map((size) => [`with size ${size}`, { props: { size } }]),
    ["with class", { props: { class: "custom-class" } }],
    ["with ui", { props: { ui: { base: "rounded-lg" } } }],
  ] as [string, { props?: FormFieldGroupProps }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(FormFieldGroup, options);
    await nextTick();

    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  test("renders correctly with Button children", async () => {
    const Wrapper = defineComponent({
      components: { FormFieldGroup, Button },
      template: `
        <FormFieldGroup>
          <Button label="First" />
          <Button label="Second" />
          <Button label="Third" />
        </FormFieldGroup>
      `,
    });
    const screen = page.render(Wrapper);
    await nextTick();

    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  test("renders correctly with Input and Button children", async () => {
    const Wrapper = defineComponent({
      components: { FormFieldGroup, Input, Button },
      template: `
        <FormFieldGroup>
          <Input model-value="Text" />
          <Button label="Submit" />
        </FormFieldGroup>
      `,
    });
    const screen = page.render(Wrapper);
    await nextTick();

    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  test("renders correctly with InputNumber and Button children", async () => {
    const Wrapper = defineComponent({
      components: { FormFieldGroup, InputNumber, Button },
      template: `
        <FormFieldGroup>
          <InputNumber :model-value="5" :increment="false" :decrement="false" />
          <Button label="Apply" />
        </FormFieldGroup>
      `,
    });
    const screen = page.render(Wrapper);
    await nextTick();

    expect(screen.container.outerHTML).toMatchSnapshot();
  });
});
