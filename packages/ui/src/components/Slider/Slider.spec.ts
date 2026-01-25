import { TooltipProvider } from "reka-ui";
import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent, nextTick } from "vue";
import { Key } from "webdriverio";

import type { SliderProps } from "./Slider.vue";
import Slider from "./Slider.vue";

const SliderWrapper = defineComponent({
  components: { TooltipProvider, Slider },
  inheritAttrs: false,
  template: `<TooltipProvider>
  <Slider v-bind="$attrs" />
</TooltipProvider>`,
});

describe("Slider", () => {
  const sizes = ["sm", "md", "lg"] as const;

  test.each([
    ["with id", { props: { id: "volume" } }],
    ["with name", { props: { name: "volume" } }],
    ["with disabled", { props: { disabled: true } }],
    ["with min and max", { props: { min: 0, max: 50 } }],
    ["with step", { props: { step: 10 } }],
    ["with tooltip", { props: { tooltip: true } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { size } }]),
    ["with class", { props: { class: "w-64" } }],
    ["with ui", { props: { ui: { track: "bg-red-500" } } }],
  ] as [string, { props?: SliderProps }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(SliderWrapper, options);
    await nextTick();

    expect(screen.container).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:modelValue event", async () => {
      const screen = page.render(Slider, { props: { modelValue: 50 } });
      await nextTick();

      const slider = screen.getByRole("slider");

      await userEvent.click(slider);
      await userEvent.keyboard(Key.ArrowRight);

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });

    test("change event", async () => {
      const screen = page.render(Slider, { props: { modelValue: 50 } });
      await nextTick();

      const slider = screen.getByRole("slider");

      await userEvent.click(slider);
      await userEvent.keyboard(Key.ArrowRight);
      await userEvent.keyboard(Key.Enter);

      expect(screen.emitted()).toHaveProperty("change");
    });
  });
});
