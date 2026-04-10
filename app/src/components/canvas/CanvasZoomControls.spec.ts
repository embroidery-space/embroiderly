import { App } from "@embroiderly/ui";

import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent, nextTick } from "vue";

import CanvasZoomControls from "./CanvasZoomControls.vue";

const CanvasZoomControlsWrapper = defineComponent({
  components: { App, CanvasZoomControls },
  inheritAttrs: false,
  template: `<App><CanvasZoomControls v-bind="$attrs" /></App>`,
});

describe("CanvasZoomControls", () => {
  test("displays zoom controls", async () => {
    const screen = page.render(CanvasZoomControlsWrapper, {
      props: { modelValue: 50 },
    });
    await nextTick();

    // Input number.
    await expect.element(screen.getByRole("spinbutton")).toBeVisible();

    // Dropdown trigger button.
    await expect.element(page.getByRole("button", { expanded: false })).toBeVisible();

    // Slider for zoom level.
    await expect.element(screen.getByRole("slider")).toBeVisible();

    // Zoom in/out buttons.
    await expect.element(screen.getByRole("button", { name: "Zoom In" })).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Zoom Out" })).toBeVisible();
  });

  describe("zoom buttons", () => {
    test("hovering zoom-in button shows tooltip", async () => {
      const screen = page.render(CanvasZoomControlsWrapper, {
        props: { modelValue: 50 },
      });
      await nextTick();

      await userEvent.hover(screen.getByRole("button", { name: "Zoom In" }));

      // In Reka UI, the real tooltip content is actually hidden.
      await expect.element(page.getByRole("tooltip", { name: "Zoom In", includeHidden: true })).toBeVisible();
    });

    test("hovering zoom-out button shows tooltip", async () => {
      const screen = page.render(CanvasZoomControlsWrapper, {
        props: { modelValue: 50 },
      });
      await nextTick();

      await userEvent.hover(screen.getByRole("button", { name: "Zoom Out" }));

      // In Reka UI, the real tooltip content is actually hidden.
      await expect.element(page.getByRole("tooltip", { name: "Zoom Out", includeHidden: true })).toBeVisible();
    });

    test("clicking zoom-in button emits update:modelValue event with value + 10", async () => {
      const onUpdateModelValue = vi.fn();

      const screen = page.render(CanvasZoomControlsWrapper, {
        props: { modelValue: 50, "onUpdate:modelValue": onUpdateModelValue },
      });
      await nextTick();

      await userEvent.click(screen.getByRole("button", { name: "Zoom In" }));

      expect(onUpdateModelValue).toHaveBeenCalledTimes(1);
      expect(onUpdateModelValue).toHaveBeenCalledWith(60);
    });

    test("clicking zoom-out button emits update:modelValue event with value - 10", async () => {
      const onUpdateModelValue = vi.fn();

      const screen = page.render(CanvasZoomControlsWrapper, {
        props: { modelValue: 50, "onUpdate:modelValue": onUpdateModelValue },
      });
      await nextTick();

      await userEvent.click(screen.getByRole("button", { name: "Zoom Out" }));

      expect(onUpdateModelValue).toHaveBeenCalledTimes(1);
      expect(onUpdateModelValue).toHaveBeenCalledWith(40);
    });

    test("zoom-in action respects max boundary", async () => {
      const onUpdateModelValue = vi.fn();

      const screen = page.render(CanvasZoomControlsWrapper, {
        props: { modelValue: 95, max: 100, "onUpdate:modelValue": onUpdateModelValue },
      });
      await nextTick();

      await userEvent.click(screen.getByRole("button", { name: "Zoom In" }));

      expect(onUpdateModelValue).toHaveBeenCalledTimes(1);
      expect(onUpdateModelValue).toHaveBeenCalledWith(100);
    });

    test("zoom-out action respects min boundary", async () => {
      const onUpdateModelValue = vi.fn();

      const screen = page.render(CanvasZoomControlsWrapper, {
        props: { modelValue: 5, min: 0, "onUpdate:modelValue": onUpdateModelValue },
      });
      await nextTick();

      await userEvent.click(screen.getByRole("button", { name: "Zoom Out" }));

      expect(onUpdateModelValue).toHaveBeenCalledTimes(1);
      expect(onUpdateModelValue).toHaveBeenCalledWith(0);
    });
  });

  describe("dropdown menu", () => {
    test("displays zoom options", async () => {
      const screen = page.render(CanvasZoomControlsWrapper, {
        props: { modelValue: 50 },
      });
      await nextTick();

      await userEvent.click(page.getByRole("button", { expanded: false }));

      await expect.element(screen.getByRole("menuitem", { name: "Fit" }).first()).toBeVisible();
      await expect.element(screen.getByRole("menuitem", { name: "Fit Width" })).toBeVisible();
      await expect.element(screen.getByRole("menuitem", { name: "Fit Height" })).toBeVisible();
    });

    test('clicking "Fit" item emits update:modelValue event with "fit"', async () => {
      const onUpdateModelValue = vi.fn();

      const screen = page.render(CanvasZoomControlsWrapper, {
        props: { modelValue: 50, "onUpdate:modelValue": onUpdateModelValue },
      });
      await nextTick();

      await userEvent.click(page.getByRole("button", { expanded: false }));
      await userEvent.click(screen.getByRole("menuitem", { name: "Fit" }).first());

      expect(onUpdateModelValue).toHaveBeenCalledTimes(1);
      expect(onUpdateModelValue).toHaveBeenCalledWith("fit");
    });

    test('clicking "Fit Width" item emits update:modelValue event with "fit-width"', async () => {
      const onUpdateModelValue = vi.fn();

      const screen = page.render(CanvasZoomControlsWrapper, {
        props: { modelValue: 50, "onUpdate:modelValue": onUpdateModelValue },
      });
      await nextTick();

      await userEvent.click(page.getByRole("button", { expanded: false }));
      await userEvent.click(screen.getByRole("menuitem", { name: "Fit Width" }));

      expect(onUpdateModelValue).toHaveBeenCalledTimes(1);
      expect(onUpdateModelValue).toHaveBeenCalledWith("fit-width");
    });

    test('clicking "Fit Height" item emits update:modelValue event with "fit-height"', async () => {
      const onUpdateModelValue = vi.fn();

      const screen = page.render(CanvasZoomControlsWrapper, {
        props: { modelValue: 50, "onUpdate:modelValue": onUpdateModelValue },
      });
      await nextTick();

      await userEvent.click(page.getByRole("button", { expanded: false }));
      await userEvent.click(screen.getByRole("menuitem", { name: "Fit Height" }));

      expect(onUpdateModelValue).toHaveBeenCalledTimes(1);
      expect(onUpdateModelValue).toHaveBeenCalledWith("fit-height");
    });
  });

  describe("input number", () => {
    test("changing the value emits update:modelValue event with the entered number", async () => {
      const onUpdateModelValue = vi.fn();

      const screen = page.render(CanvasZoomControlsWrapper, {
        props: { modelValue: 50, "onUpdate:modelValue": onUpdateModelValue },
      });
      await nextTick();

      await userEvent.fill(screen.getByRole("spinbutton"), "75");
      await userEvent.keyboard("{Enter}");

      expect(onUpdateModelValue).toHaveBeenCalledWith(75);
    });
  });

  describe("slider", () => {
    test("pressing ArrowRight emits update:modelValue event with value + 1", async () => {
      const onUpdateModelValue = vi.fn();

      const screen = page.render(CanvasZoomControlsWrapper, {
        props: { modelValue: 50, "onUpdate:modelValue": onUpdateModelValue },
      });
      await nextTick();

      await userEvent.click(screen.getByRole("slider"));
      await userEvent.keyboard("{ArrowRight}");

      expect(onUpdateModelValue).toHaveBeenCalledTimes(1);
      expect(onUpdateModelValue).toHaveBeenCalledWith(51);
    });

    test("pressing ArrowLeft emits update:modelValue event with value - 1", async () => {
      const onUpdateModelValue = vi.fn();

      const screen = page.render(CanvasZoomControlsWrapper, {
        props: { modelValue: 50, "onUpdate:modelValue": onUpdateModelValue },
      });
      await nextTick();

      await userEvent.click(screen.getByRole("slider"));
      await userEvent.keyboard("{ArrowLeft}");

      expect(onUpdateModelValue).toHaveBeenCalledTimes(1);
      expect(onUpdateModelValue).toHaveBeenCalledWith(49);
    });
  });

  describe("keyboard shortcuts", () => {
    test("Ctrl++ triggers zoom-in action", async () => {
      const onUpdateModelValue = vi.fn();

      page.render(CanvasZoomControlsWrapper, {
        props: { modelValue: 50, "onUpdate:modelValue": onUpdateModelValue },
      });
      await nextTick();

      await userEvent.keyboard("{Control>}={/Control}");

      expect(onUpdateModelValue).toHaveBeenCalledTimes(1);
      expect(onUpdateModelValue).toHaveBeenCalledWith(60);
    });

    test("Ctrl+- triggers zoom-out action", async () => {
      const onUpdateModelValue = vi.fn();

      page.render(CanvasZoomControlsWrapper, {
        props: { modelValue: 50, "onUpdate:modelValue": onUpdateModelValue },
      });
      await nextTick();

      await userEvent.keyboard("{Control>}-{/Control}");

      expect(onUpdateModelValue).toHaveBeenCalledTimes(1);
      expect(onUpdateModelValue).toHaveBeenCalledWith(40);
    });

    test("Ctrl+0 triggers fit action", async () => {
      const onUpdateModelValue = vi.fn();

      page.render(CanvasZoomControlsWrapper, {
        props: { modelValue: 50, "onUpdate:modelValue": onUpdateModelValue },
      });
      await nextTick();

      await userEvent.keyboard("{Control>}0{/Control}");

      expect(onUpdateModelValue).toHaveBeenCalledTimes(1);
      expect(onUpdateModelValue).toHaveBeenCalledWith("fit");
    });
  });
});
