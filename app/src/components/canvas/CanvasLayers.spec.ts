import { App } from "@embroiderly/ui";

import { describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent } from "vue";

import { Layer } from "~/lib/pattern/";
import { renderComponent } from "~test-utils/render-component.ts";
import { withBidi } from "~test-utils/with-bidi.ts";

import CanvasLayers from "./CanvasLayers.vue";

const CanvasLayersWrapper = defineComponent({
  components: { App, CanvasLayers },
  inheritAttrs: false,
  template: `<App><CanvasLayers v-bind="$attrs" /></App>`,
});

describe("CanvasLayers", () => {
  test("displays header with actions and tree", async () => {
    const screen = await renderComponent(CanvasLayersWrapper, {
      props: { modelValue: 0, layers: [new Layer(0, { name: "My layer" })] },
    });

    // Header title.
    await expect.element(screen.getByText("Layers")).toBeVisible();

    // Header actions.
    await expect.element(screen.getByRole("button", { name: "Add Layer" })).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Remove Layer" })).toBeVisible();

    // Tree.
    await expect.element(screen.getByRole("tree")).toBeVisible();
    await expect.element(screen.getByRole("treeitem", { level: 1, name: "My layer" })).toBeVisible();
    await expect.element(screen.getByRole("treeitem", { level: 2, name: "Full Stitches" })).toBeVisible();
    await expect.element(screen.getByRole("treeitem", { level: 2, name: "Petite Stitches" })).toBeVisible();
    await expect.element(screen.getByRole("treeitem", { level: 2, name: "Half Stitches" })).toBeVisible();
    await expect.element(screen.getByRole("treeitem", { level: 2, name: "Quarter Stitches" })).toBeVisible();
    await expect.element(screen.getByRole("treeitem", { level: 2, name: "Back Stitches" })).toBeVisible();
    await expect.element(screen.getByRole("treeitem", { level: 2, name: "Straight Stitches" })).toBeVisible();
    await expect.element(screen.getByRole("treeitem", { level: 2, name: "Special Stitches" })).toBeVisible();
    await expect.element(screen.getByRole("treeitem", { level: 2, name: "French Knots" })).toBeVisible();
    await expect.element(screen.getByRole("treeitem", { level: 2, name: "Beads" })).toBeVisible();
  });

  test("displays placeholder name when layer name is empty", async () => {
    const screen = await renderComponent(CanvasLayersWrapper, {
      props: { modelValue: 0, layers: [new Layer(0)] },
    });
    await expect.element(screen.getByRole("treeitem", { level: 1 })).toHaveTextContent(withBidi`Layer ${1}`);
  });

  test("displays layer name when set", async () => {
    const screen = await renderComponent(CanvasLayersWrapper, {
      props: { modelValue: 0, layers: [new Layer(0, { name: "My Layer" })] },
    });
    await expect.element(screen.getByRole("treeitem", { level: 1 })).toHaveTextContent("My Layer");
  });

  test("remove button is disabled with a single layer", async () => {
    const screen = await renderComponent(CanvasLayersWrapper, {
      props: { modelValue: 0, layers: [new Layer(0)] },
    });
    await expect.element(screen.getByRole("button", { name: "Remove Layer" })).toBeDisabled();
  });

  test("remove button is enabled with multiple layers", async () => {
    const screen = await renderComponent(CanvasLayersWrapper, {
      props: { modelValue: 0, layers: [new Layer(0), new Layer(1)] },
    });
    await expect.element(screen.getByRole("button", { name: "Remove Layer" })).not.toBeDisabled();
  });

  test("clicking add button emits addLayer event", async () => {
    const onAddLayer = vi.fn();

    const screen = await renderComponent(CanvasLayersWrapper, {
      props: { modelValue: 0, layers: [new Layer(0)], onAddLayer },
    });

    await userEvent.click(screen.getByRole("button", { name: "Add Layer" }));

    expect(onAddLayer).toHaveBeenCalledTimes(1);
  });

  test("clicking remove button emits removeLayer event with the selected layer index", async () => {
    const onRemoveLayer = vi.fn();

    const screen = await renderComponent(CanvasLayersWrapper, {
      props: { modelValue: 1, layers: [new Layer(0), new Layer(1)], onRemoveLayer },
    });

    await userEvent.click(screen.getByRole("button", { name: "Remove Layer" }));

    expect(onRemoveLayer).toHaveBeenCalledTimes(1);
    expect(onRemoveLayer).toHaveBeenCalledWith(1);
  });

  test("clicking a layer emits update:modelValue event with its stable index", async () => {
    const onUpdateModelValue = vi.fn();

    const screen = await renderComponent(CanvasLayersWrapper, {
      props: {
        modelValue: 0,
        layers: [new Layer(0, { name: "Layer A" }), new Layer(1, { name: "Layer B" })],
        "onUpdate:modelValue": onUpdateModelValue,
      },
    });

    await userEvent.click(screen.getByRole("treeitem", { name: "Layer B" }));

    expect(onUpdateModelValue).toHaveBeenCalledTimes(1);
    expect(onUpdateModelValue).toHaveBeenCalledWith(1);
  });

  test("clicking layer visibility button emits toggleLayerVisibility event with layer visibility flipped", async () => {
    const onToggleLayerVisibility = vi.fn();

    const screen = await renderComponent(CanvasLayersWrapper, {
      props: { modelValue: 0, layers: [new Layer(0, { name: "Layer A" })], onToggleLayerVisibility },
    });

    // The second button in the layer element is the visibility toggle button.
    await userEvent.click(screen.getByRole("treeitem", { name: "Layer A" }).getByRole("button").nth(1));

    expect(onToggleLayerVisibility).toHaveBeenCalledTimes(1);
    expect(onToggleLayerVisibility).toHaveBeenCalledWith(0, {
      visible: false, // This is the change.
      fullstitchesVisible: true,
      petitestitchesVisible: true,
      halfstitchesVisible: true,
      quarterstitchesVisible: true,
      backstitchesVisible: true,
      straightstitchesVisible: true,
      specialstitchesVisible: true,
      frenchknotsVisible: true,
      beadsVisible: true,
    });
  });

  test("clicking stitch layer visibility button emits toggleLayerVisibility event with only that stitch layer toggled", async () => {
    const onToggleLayerVisibility = vi.fn();

    const screen = await renderComponent(CanvasLayersWrapper, {
      props: { modelValue: 0, layers: [new Layer(0)], onToggleLayerVisibility },
    });

    // In stitch layers, there are no chevron buttons for expanding/collapsing layers.
    // Therefore, there is only one button which is the visibility toggle button.
    await userEvent.click(screen.getByRole("treeitem", { name: "Full Stitches", exact: true }).getByRole("button"));

    expect(onToggleLayerVisibility).toHaveBeenCalledTimes(1);
    expect(onToggleLayerVisibility).toHaveBeenCalledWith(0, {
      visible: true,
      fullstitchesVisible: false, // This is the change.
      petitestitchesVisible: true,
      halfstitchesVisible: true,
      quarterstitchesVisible: true,
      backstitchesVisible: true,
      straightstitchesVisible: true,
      specialstitchesVisible: true,
      frenchknotsVisible: true,
      beadsVisible: true,
    });
  });

  test("double-clicking a layer name and submitting emits renameLayer event", async () => {
    const onRenameLayer = vi.fn();

    const screen = await renderComponent(CanvasLayersWrapper, {
      props: { modelValue: 0, layers: [new Layer(0, { name: "My Layer" })], onRenameLayer },
    });

    const layer = screen.getByRole("treeitem", { name: "My Layer" });
    const input = layer.getByRole("textbox", { includeHidden: true });

    // The input is hidden initially.
    await expect.element(input).not.toBeVisible();

    // Double-click exactly on the label, not on the layer itself.
    await userEvent.dblClick(layer.getByText("My Layer"));

    // Now, in the editing mode, the input is visible.
    await expect.element(input).toBeVisible();

    await userEvent.fill(input, "My Awesome Layer");
    await userEvent.keyboard("{Enter}");

    expect(onRenameLayer).toHaveBeenCalledTimes(1);
    expect(onRenameLayer).toHaveBeenCalledWith(0, "My Awesome Layer");
  });

  describe("context menu", () => {
    test("displays context menu", async () => {
      const screen = await renderComponent(CanvasLayersWrapper, {
        props: { modelValue: 0, layers: [new Layer(0)] },
      });

      await userEvent.click(screen.getByRole("tree"), { button: "right" });

      await expect.element(screen.getByRole("menu")).toBeVisible();
      await expect.element(screen.getByRole("menuitem", { name: "Add Layer" })).toBeVisible();
      await expect.element(screen.getByRole("menuitem", { name: "Remove Layer" })).toBeVisible();
    });

    test("remove item is disabled with a single layer", async () => {
      const screen = await renderComponent(CanvasLayersWrapper, {
        props: { modelValue: 0, layers: [new Layer(0)] },
      });

      await userEvent.click(screen.getByRole("tree"), { button: "right" });

      await expect.element(screen.getByRole("menuitem", { name: "Remove Layer" })).toBeDisabled();
    });

    test("remove item is enabled with multiple layers", async () => {
      const screen = await renderComponent(CanvasLayersWrapper, {
        props: { modelValue: 0, layers: [new Layer(0), new Layer(1)] },
      });

      await userEvent.click(screen.getByRole("tree"), { button: "right" });

      await expect.element(screen.getByRole("menuitem", { name: "Remove Layer" })).not.toBeDisabled();
    });

    test("clicking add item emits addLayer event", async () => {
      const onAddLayer = vi.fn();

      const screen = await renderComponent(CanvasLayersWrapper, {
        props: { modelValue: 0, layers: [new Layer(0)], onAddLayer },
      });

      await userEvent.click(screen.getByRole("tree"), { button: "right" });
      await userEvent.click(screen.getByRole("menuitem", { name: "Add Layer" }));

      expect(onAddLayer).toHaveBeenCalledTimes(1);
    });

    test("clicking remove item emits removeLayer event with the selected layer index", async () => {
      const onRemoveLayer = vi.fn();

      const screen = await renderComponent(CanvasLayersWrapper, {
        props: { modelValue: 1, layers: [new Layer(0), new Layer(1)], onRemoveLayer },
      });

      await userEvent.click(screen.getByRole("tree"), { button: "right" });
      await userEvent.click(screen.getByRole("menuitem", { name: "Remove Layer" }));

      expect(onRemoveLayer).toHaveBeenCalledTimes(1);
      expect(onRemoveLayer).toHaveBeenCalledWith(1);
    });
  });
});
