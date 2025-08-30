import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";

export enum FullStitchKind {
  Full = "Full",
  Petite = "Petite",
}
export class FullStitch {
  x: number;
  y: number;
  palindex: number;
  kind: FullStitchKind;

  constructor(data: b.infer<typeof FullStitch.schema>) {
    this.x = data.x;
    this.y = data.y;
    this.palindex = data.palindex;
    this.kind = data.kind;
  }

  static readonly schema = b.struct({
    x: b.f32(),
    y: b.f32(),
    palindex: b.u32(),
    kind: b.nativeEnum(FullStitchKind),
  });
}

export enum PartStitchDirection {
  Forward = "Forward",
  Backward = "Backward",
}
export enum PartStitchKind {
  Half = "Half",
  Quarter = "Quarter",
}
export class PartStitch {
  x: number;
  y: number;
  palindex: number;
  direction: PartStitchDirection;
  kind: PartStitchKind;

  constructor(data: b.infer<typeof PartStitch.schema>) {
    this.x = data.x;
    this.y = data.y;
    this.palindex = data.palindex;
    this.direction = data.direction;
    this.kind = data.kind;
  }

  static readonly schema = b.struct({
    x: b.f32(),
    y: b.f32(),
    palindex: b.u32(),
    direction: b.nativeEnum(PartStitchDirection),
    kind: b.nativeEnum(PartStitchKind),
  });
}

export enum LineStitchKind {
  Back = "Back",
  Straight = "Straight",
}
export class LineStitch {
  x: [number, number];
  y: [number, number];
  palindex: number;
  kind: LineStitchKind;

  constructor(data: b.infer<typeof LineStitch.schema>) {
    this.x = data.x;
    this.y = data.y;
    this.palindex = data.palindex;
    this.kind = data.kind;
  }

  static readonly schema = b.struct({
    x: b.tuple(b.f32(), b.f32()),
    y: b.tuple(b.f32(), b.f32()),
    palindex: b.u32(),
    kind: b.nativeEnum(LineStitchKind),
  });
}

export enum NodeStitchKind {
  FrenchKnot = "FrenchKnot",
  Bead = "Bead",
}
export class NodeStitch {
  x: number;
  y: number;
  rotated: boolean;
  palindex: number;
  kind: NodeStitchKind;

  constructor(data: b.infer<typeof NodeStitch.schema>) {
    this.x = data.x;
    this.y = data.y;
    this.palindex = data.palindex;
    this.rotated = data.rotated;
    this.kind = data.kind;
  }

  static readonly schema = b.struct({
    x: b.f32(),
    y: b.f32(),
    rotated: b.bool(),
    palindex: b.u32(),
    kind: b.nativeEnum(NodeStitchKind),
  });
}

export class CurvedStitch {
  points: [number, number][];

  constructor(data: b.infer<typeof CurvedStitch.schema>) {
    this.points = data.points;
  }

  static readonly schema = b.struct({
    points: b.vec(b.tuple(b.f32(), b.f32())),
  });
}

export class SpecialStitch {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  flip: [boolean, boolean];
  palindex: number;
  modindex: number;

  constructor(data: b.infer<typeof SpecialStitch.schema>) {
    this.x = data.x;
    this.y = data.y;
    this.width = data.width;
    this.height = data.height;
    this.palindex = data.palindex;
    this.modindex = data.modindex;
    this.rotation = data.rotation;
    this.flip = data.flip;
  }

  static readonly schema = b.struct({
    x: b.f32(),
    y: b.f32(),
    width: b.f32(),
    height: b.f32(),
    rotation: b.u16(),
    flip: b.tuple(b.bool(), b.bool()),
    palindex: b.u32(),
    modindex: b.u32(),
  });
}

export class SpecialStitchModel {
  uniqueName: string;
  name: string;
  width: number;
  height: number;
  nodestitches: NodeStitch[];
  linestitches: LineStitch[];
  curvedstitches: CurvedStitch[];

  constructor(data: b.infer<typeof SpecialStitchModel.schema>) {
    this.uniqueName = data.uniqueName;
    this.name = data.name;
    this.width = data.width;
    this.height = data.height;
    this.nodestitches = data.nodestitches.map((stitch) => new NodeStitch(stitch));
    this.linestitches = data.linestitches.map((stitch) => new LineStitch(stitch));
    this.curvedstitches = data.curvedstitches.map((stitch) => new CurvedStitch(stitch));
  }

  static readonly schema = b.struct({
    uniqueName: b.string(),
    name: b.string(),
    width: b.f32(),
    height: b.f32(),
    nodestitches: b.vec(NodeStitch.schema),
    linestitches: b.vec(LineStitch.schema),
    curvedstitches: b.vec(CurvedStitch.schema),
  });
}

export type Stitch = FullStitch | PartStitch | NodeStitch | LineStitch;
export type StitchKind = FullStitchKind | PartStitchKind | NodeStitchKind | LineStitchKind;

const StitchSchema = b.enum({
  full: FullStitch.schema,
  part: PartStitch.schema,
  line: LineStitch.schema,
  node: NodeStitch.schema,
});
const StitchesSchema = b.vec(StitchSchema);

export function serializeStitch(stitch: Stitch) {
  if (stitch instanceof FullStitch) return StitchSchema.serialize({ full: stitch });
  if (stitch instanceof PartStitch) return StitchSchema.serialize({ part: stitch });
  if (stitch instanceof LineStitch) return StitchSchema.serialize({ line: stitch });
  if (stitch instanceof NodeStitch) return StitchSchema.serialize({ node: stitch });
  throw new Error("Invalid stitch variant");
}

export function deserializeStitches(data: Uint8Array | string) {
  const buffer = typeof data === "string" ? toByteArray(data) : data;
  return StitchesSchema.deserialize(buffer).map((stitch) => {
    if ("full" in stitch) return new FullStitch(stitch.full);
    if ("part" in stitch) return new PartStitch(stitch.part);
    if ("line" in stitch) return new LineStitch(stitch.line);
    if ("node" in stitch) return new NodeStitch(stitch.node);
    throw new Error("Invalid stitch variant");
  });
}
