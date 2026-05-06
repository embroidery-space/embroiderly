import { b } from "@zorsh/zorsh";

import {
  FullStitch,
  FullStitchKind,
  PartStitch,
  PartStitchKind,
  LineStitch,
  LineStitchKind,
  NodeStitch,
  NodeStitchKind,
  SpecialStitch,
} from "./stitches.ts";

export class LayerVisibility {
  visible: boolean;

  fullstitchesVisible: boolean;
  petitestitchesVisible: boolean;

  halfstitchesVisible: boolean;
  quarterstitchesVisible: boolean;

  backstitchesVisible: boolean;
  straightstitchesVisible: boolean;

  frenchknotsVisible: boolean;
  beadsVisible: boolean;

  specialstitchesVisible: boolean;

  constructor(data: b.infer<typeof LayerVisibility.schema>) {
    this.visible = data.visible;

    this.fullstitchesVisible = data.fullstitchesVisible;
    this.petitestitchesVisible = data.petitestitchesVisible;

    this.halfstitchesVisible = data.halfstitchesVisible;
    this.quarterstitchesVisible = data.quarterstitchesVisible;

    this.backstitchesVisible = data.backstitchesVisible;
    this.straightstitchesVisible = data.straightstitchesVisible;

    this.frenchknotsVisible = data.frenchknotsVisible;
    this.beadsVisible = data.beadsVisible;

    this.specialstitchesVisible = data.specialstitchesVisible;
  }

  // Field order matches the Rust `LayerVisibility` struct declaration for Borsh compatibility.
  static readonly schema = b.struct({
    visible: b.bool(),

    fullstitchesVisible: b.bool(),
    petitestitchesVisible: b.bool(),

    halfstitchesVisible: b.bool(),
    quarterstitchesVisible: b.bool(),

    backstitchesVisible: b.bool(),
    straightstitchesVisible: b.bool(),

    frenchknotsVisible: b.bool(),
    beadsVisible: b.bool(),

    specialstitchesVisible: b.bool(),
  });

  static deserialize(data: Uint8Array) {
    return new LayerVisibility(LayerVisibility.schema.deserialize(data));
  }

  static serialize(data: LayerVisibility) {
    return LayerVisibility.schema.serialize(data);
  }
}

export class Layer {
  readonly index: number;
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

  constructor(index: number, data?: Partial<b.infer<typeof Layer.schema>>) {
    this.index = index;
    this.name = data?.name ?? "";
    this.visible = data?.visible ?? true;

    this.fullstitches = data?.fullstitches?.map((s) => new FullStitch(s)) ?? [];
    this.fullstitchesVisible = data?.fullstitchesVisible ?? true;
    this.petitestitchesVisible = data?.petitestitchesVisible ?? true;

    this.partstitches = data?.partstitches?.map((s) => new PartStitch(s)) ?? [];
    this.halfstitchesVisible = data?.halfstitchesVisible ?? true;
    this.quarterstitchesVisible = data?.quarterstitchesVisible ?? true;

    this.linestitches = data?.linestitches?.map((s) => new LineStitch(s)) ?? [];
    this.backstitchesVisible = data?.backstitchesVisible ?? true;
    this.straightstitchesVisible = data?.straightstitchesVisible ?? true;

    this.nodestitches = data?.nodestitches?.map((s) => new NodeStitch(s)) ?? [];
    this.frenchknotsVisible = data?.frenchknotsVisible ?? true;
    this.beadsVisible = data?.beadsVisible ?? true;

    this.specialstitches = data?.specialstitches?.map((s) => new SpecialStitch(s)) ?? [];
    this.specialstitchesVisible = data?.specialstitchesVisible ?? true;
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

  static deserialize(data: Uint8Array) {
    return new Layer(0, Layer.schema.deserialize(data));
  }

  /** Returns an object with the counts of each stitch type on this layer. */
  stitchCounts() {
    return {
      fullStitches: this.fullstitches.filter((s) => s.kind === FullStitchKind.Full).length,
      petiteStitches: this.fullstitches.filter((s) => s.kind === FullStitchKind.Petite).length,
      halfStitches: this.partstitches.filter((s) => s.kind === PartStitchKind.Half).length,
      quarterStitches: this.partstitches.filter((s) => s.kind === PartStitchKind.Quarter).length,
      backStitches: this.linestitches.filter((s) => s.kind === LineStitchKind.Back).length,
      straightStitches: this.linestitches.filter((s) => s.kind === LineStitchKind.Straight).length,
      frenchKnots: this.nodestitches.filter((s) => s.kind === NodeStitchKind.FrenchKnot).length,
      beads: this.nodestitches.filter((s) => s.kind === NodeStitchKind.Bead).length,
      specialStitches: this.specialstitches.length,
    };
  }

  getVisibility(): LayerVisibility {
    return new LayerVisibility({
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
    });
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
}

export class Layers {
  #items: Layer[];
  #positions: number[];

  constructor(data?: b.infer<typeof Layers.schema> | Layer[] | Layers) {
    if (data instanceof Layers) {
      this.#items = data.#items;
      this.#positions = data.#positions;
    } else if (Array.isArray(data)) {
      this.#items = data;
      this.#positions = data.map((_, i) => i);
    } else {
      this.#items = data?.items.map((item, index) => new Layer(index, item)) ?? [];
      this.#positions = data?.positions ?? [];
    }
  }

  static readonly schema = b.struct({
    items: b.vec(Layer.schema),
    positions: b.vec(b.u32()),
  });

  // === Access Methods ===

  /** The number of layers. */
  get length(): number {
    return this.#items.length;
  }

  /** Returns a layer by its actual index. */
  get(index: number): Layer | undefined {
    return this.#items[index];
  }

  // === Iteration Methods ===

  /** Layers in actual order. */
  get items(): readonly Layer[] {
    return this.#items;
  }

  /** Layers in visual order. */
  get itemsInVisualOrder(): Layer[] {
    return this.#positions.map((index) => this.#items[index]!);
  }

  // === Ordering Methods ===

  /** The current visual positions. */
  get positions(): readonly number[] {
    return this.#positions;
  }
  set positions(positions: number[]) {
    if (import.meta.env.DEV && positions.length !== this.#items.length) {
      throw new Error("Positions array length must match items length");
    }
    this.#positions = [...positions];
  }

  // === Mutation Methods ===

  /** Inserts a layer at a specific actual index. Updates positions accordingly. */
  insert(index: number, layer: Layer): void {
    this.#items.splice(index, 0, layer);

    // Shift all positions that reference indexes >= index.
    for (let i = 0; i < this.#positions.length; i++) {
      if (this.#positions[i]! >= index) this.#positions[i]!++;
    }

    // Layers maintain descending index order (higher index = newer = top),
    // so insert before the first position whose value is less than the new index.
    const position = this.#positions.findIndex((idx) => idx < index);
    const insertAt = position === -1 ? this.#positions.length : position;
    this.#positions.splice(insertAt, 0, index);
  }

  /** Removes a layer by its actual index. Returns the removed layer. */
  remove(index: number): Layer {
    // Remove from items.
    const [removed] = this.#items.splice(index, 1);

    // Remove from positions.
    this.#positions = this.#positions.filter((idx) => idx !== index);

    // Shift all positions which reference indexes > index.
    for (let i = 0; i < this.#positions.length; i++) {
      if (this.#positions[i]! > index) {
        this.#positions[i]!--;
      }
    }

    return removed!;
  }
}

export class AddedLayerData {
  index: number;
  layer: Layer;

  constructor(data: b.infer<typeof AddedLayerData.schema>) {
    this.index = data.index;
    this.layer = new Layer(data.index, data.layer);
  }

  static readonly schema = b.struct({
    index: b.u32(),
    layer: Layer.schema,
  });

  static deserialize(data: Uint8Array) {
    return new AddedLayerData(AddedLayerData.schema.deserialize(data));
  }
}

export class RenamedLayerData {
  layerIndex: number;
  name: string;

  constructor(data: b.infer<typeof RenamedLayerData.schema>) {
    this.layerIndex = data.layerIndex;
    this.name = data.name;
  }

  static readonly schema = b.struct({
    layerIndex: b.u32(),
    name: b.string(),
  });

  static deserialize(data: Uint8Array) {
    return new RenamedLayerData(RenamedLayerData.schema.deserialize(data));
  }
}

export class UpdatedLayerVisibilityData {
  layerIndex: number;
  visibility: LayerVisibility;

  constructor(data: b.infer<typeof UpdatedLayerVisibilityData.schema>) {
    this.layerIndex = data.layerIndex;
    this.visibility = new LayerVisibility(data.visibility);
  }

  static readonly schema = b.struct({
    layerIndex: b.u32(),
    visibility: LayerVisibility.schema,
  });

  static deserialize(data: Uint8Array) {
    return new UpdatedLayerVisibilityData(UpdatedLayerVisibilityData.schema.deserialize(data));
  }
}
