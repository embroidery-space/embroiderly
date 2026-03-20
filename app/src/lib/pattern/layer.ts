import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";

import type { LayerVisibility } from "~/api/endpoints/pattern.ts";

import { FullStitch, PartStitch, LineStitch, NodeStitch, SpecialStitch } from "./stitches.ts";

export class Layer {
  name: string;
  visible: boolean;

  fullstitches: FullStitch[];
  fullstitchesVisible: boolean;
  petitestitchesVisible: boolean;

  partstitches: PartStitch[];
  halfstitchesVisible: boolean;
  quarterstitchesVisible: boolean;

  linestitches: LineStitch[];
  backstitchesVisible: boolean;
  straightstitchesVisible: boolean;

  nodestitches: NodeStitch[];
  frenchknotsVisible: boolean;
  beadsVisible: boolean;

  specialstitches: SpecialStitch[];
  specialstitchesVisible: boolean;

  constructor(data: b.infer<typeof Layer.schema>) {
    this.name = data.name;
    this.visible = data.visible;

    this.fullstitches = data.fullstitches.map((s) => new FullStitch(s));
    this.fullstitchesVisible = data.fullstitchesVisible;
    this.petitestitchesVisible = data.petitestitchesVisible;

    this.partstitches = data.partstitches.map((s) => new PartStitch(s));
    this.halfstitchesVisible = data.halfstitchesVisible;
    this.quarterstitchesVisible = data.quarterstitchesVisible;

    this.linestitches = data.linestitches.map((s) => new LineStitch(s));
    this.backstitchesVisible = data.backstitchesVisible;
    this.straightstitchesVisible = data.straightstitchesVisible;

    this.nodestitches = data.nodestitches.map((s) => new NodeStitch(s));
    this.frenchknotsVisible = data.frenchknotsVisible;
    this.beadsVisible = data.beadsVisible;

    this.specialstitches = data.specialstitches.map((s) => new SpecialStitch(s));
    this.specialstitchesVisible = data.specialstitchesVisible;
  }

  static readonly schema = b.struct({
    name: b.string(),
    visible: b.bool(),

    fullstitches: b.vec(FullStitch.schema),
    fullstitchesVisible: b.bool(),
    petitestitchesVisible: b.bool(),

    partstitches: b.vec(PartStitch.schema),
    halfstitchesVisible: b.bool(),
    quarterstitchesVisible: b.bool(),

    linestitches: b.vec(LineStitch.schema),
    backstitchesVisible: b.bool(),
    straightstitchesVisible: b.bool(),

    nodestitches: b.vec(NodeStitch.schema),
    frenchknotsVisible: b.bool(),
    beadsVisible: b.bool(),

    specialstitches: b.vec(SpecialStitch.schema),
    specialstitchesVisible: b.bool(),
  });

  getVisibility(): LayerVisibility {
    return {
      visible: this.visible,

      fullstitchesVisible: this.fullstitchesVisible,
      petitestitchesVisible: this.petitestitchesVisible,

      halfstitchesVisible: this.halfstitchesVisible,
      quarterstitchesVisible: this.quarterstitchesVisible,

      backstitchesVisible: this.backstitchesVisible,
      straightstitchesVisible: this.straightstitchesVisible,

      frenchknotsVisible: this.frenchknotsVisible,
      beadsVisible: this.beadsVisible,

      specialstitchesVisible: this.specialstitchesVisible,
    };
  }

  setVisibility(vis: LayerVisibility): void {
    this.visible = vis.visible;

    this.fullstitchesVisible = vis.fullstitchesVisible;
    this.petitestitchesVisible = vis.petitestitchesVisible;

    this.halfstitchesVisible = vis.halfstitchesVisible;
    this.quarterstitchesVisible = vis.quarterstitchesVisible;

    this.backstitchesVisible = vis.backstitchesVisible;
    this.straightstitchesVisible = vis.straightstitchesVisible;

    this.frenchknotsVisible = vis.frenchknotsVisible;
    this.beadsVisible = vis.beadsVisible;

    this.specialstitchesVisible = vis.specialstitchesVisible;
  }

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new Layer(Layer.schema.deserialize(buffer));
  }
}

export class AddedLayerData {
  index: number;
  layer: Layer;

  constructor(data: b.infer<typeof AddedLayerData.schema>) {
    this.index = data.index;
    this.layer = new Layer(data.layer);
  }

  static readonly schema = b.struct({
    index: b.u32(),
    layer: Layer.schema,
  });

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new AddedLayerData(AddedLayerData.schema.deserialize(buffer));
  }
}
