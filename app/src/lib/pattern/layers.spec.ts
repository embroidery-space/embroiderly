import { describe, expect, test } from "vitest";

import { Layer, Layers } from "./layers.ts";

describe("Layers", () => {
  test("creates with no layers when no data provided", () => {
    const layers = new Layers();
    expect(layers.length).toBe(0);
    expect(layers.positions).toEqual([]);
  });

  test("returns layers in visual order", () => {
    const layers = new Layers([new Layer(0, { name: "A" }), new Layer(1, { name: "B" }), new Layer(2, { name: "C" })]);
    layers.positions = [2, 0, 1];

    const visualOrder = layers.itemsInVisualOrder;
    expect(visualOrder.length).toBe(3);
    expect(visualOrder[0]!.name).toBe("C");
    expect(visualOrder[1]!.name).toBe("A");
    expect(visualOrder[2]!.name).toBe("B");
  });

  test("inserts layer at specific index and updates positions", () => {
    const layers = new Layers([new Layer(0, { name: "A" }), new Layer(1, { name: "B" }), new Layer(2, { name: "C" })]);

    layers.insert(1, new Layer(1, { name: "D" }));

    expect(layers.length).toBe(4);
    expect(layers.get(1)!.name).toBe("D");
    expect(layers.positions).toEqual([1, 0, 2, 3]);

    const visualOrder = layers.itemsInVisualOrder;
    expect(visualOrder[0]!.name).toBe("D");
    expect(visualOrder[1]!.name).toBe("A");
    expect(visualOrder[2]!.name).toBe("B");
    expect(visualOrder[3]!.name).toBe("C");
  });

  test("inserts layer at beginning and updates all positions", () => {
    const layers = new Layers([new Layer(0, { name: "A" }), new Layer(1, { name: "B" })]);

    layers.insert(0, new Layer(0, { name: "C" }));

    expect(layers.length).toBe(3);
    expect(layers.get(0)!.name).toBe("C");
    expect(layers.positions).toEqual([1, 2, 0]);
  });

  test("removes layer and updates positions", () => {
    const layers = new Layers([new Layer(0, { name: "A" }), new Layer(1, { name: "B" }), new Layer(2, { name: "C" })]);

    const removed = layers.remove(1);
    expect(removed.name).toBe("B");

    expect(layers.length).toBe(2);
    expect(layers.positions).toEqual([0, 1]);
    expect(layers.get(0)!.name).toBe("A");
    expect(layers.get(1)!.name).toBe("C");
  });

  test("removes layer with reordered positions", () => {
    const layers = new Layers([
      new Layer(0, { name: "A" }),
      new Layer(1, { name: "B" }),
      new Layer(2, { name: "C" }),
      new Layer(3, { name: "D" }),
    ]);
    layers.positions = [2, 0, 3, 1];

    const removed = layers.remove(1);
    expect(removed.name).toBe("B");

    expect(layers.length).toBe(3);
    expect(layers.positions).toEqual([1, 0, 2]);

    const visualOrder = layers.itemsInVisualOrder;
    expect(visualOrder[0]!.name).toBe("C");
    expect(visualOrder[1]!.name).toBe("A");
    expect(visualOrder[2]!.name).toBe("D");
  });

  test("positions setter updates visual order", () => {
    const layers = new Layers([new Layer(0, { name: "A" }), new Layer(1, { name: "B" }), new Layer(2, { name: "C" })]);

    layers.positions = [2, 1, 0];
    expect(layers.positions).toEqual([2, 1, 0]);

    const visualOrder = layers.itemsInVisualOrder;
    expect(visualOrder[0]!.name).toBe("C");
    expect(visualOrder[1]!.name).toBe("B");
    expect(visualOrder[2]!.name).toBe("A");
  });
});

describe("Layer", () => {
  test("creates with stable index", () => {
    const layer = new Layer(3, { name: "My Layer" });
    expect(layer.index).toBe(3);
    expect(layer.name).toBe("My Layer");
  });

  test("defaults all visibility flags to true", () => {
    const layer = new Layer(0);
    const vis = layer.getVisibility();
    expect(vis.visible).toBe(true);
    expect(vis.fullstitchesVisible).toBe(true);
    expect(vis.petitestitchesVisible).toBe(true);
    expect(vis.halfstitchesVisible).toBe(true);
    expect(vis.quarterstitchesVisible).toBe(true);
    expect(vis.backstitchesVisible).toBe(true);
    expect(vis.straightstitchesVisible).toBe(true);
    expect(vis.frenchknotsVisible).toBe(true);
    expect(vis.beadsVisible).toBe(true);
    expect(vis.specialstitchesVisible).toBe(true);
  });

  test("setVisibility updates all flags", () => {
    const layer = new Layer(0);
    layer.setVisibility({
      visible: false,
      fullstitchesVisible: false,
      petitestitchesVisible: false,
      halfstitchesVisible: false,
      quarterstitchesVisible: false,
      backstitchesVisible: false,
      straightstitchesVisible: false,
      frenchknotsVisible: false,
      beadsVisible: false,
      specialstitchesVisible: false,
    });

    const vis = layer.getVisibility();
    expect(vis.visible).toBe(false);
    expect(vis.fullstitchesVisible).toBe(false);
    expect(vis.petitestitchesVisible).toBe(false);
    expect(vis.halfstitchesVisible).toBe(false);
    expect(vis.quarterstitchesVisible).toBe(false);
    expect(vis.backstitchesVisible).toBe(false);
    expect(vis.straightstitchesVisible).toBe(false);
    expect(vis.frenchknotsVisible).toBe(false);
    expect(vis.beadsVisible).toBe(false);
    expect(vis.specialstitchesVisible).toBe(false);
  });
});
