import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";

import { FullStitch, LineStitch, NodeStitch, PartStitch, type Stitch } from "./pattern.ts";

const StitchSchema = b.enum({
  full: FullStitch.schema,
  part: PartStitch.schema,
  line: LineStitch.schema,
  node: NodeStitch.schema,
});
const StitchesSchema = b.vec(StitchSchema);

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

export function deserializeStitch(buffer: Uint8Array | string) {
  const data = typeof buffer === "string" ? toByteArray(buffer) : buffer;
  const stitch = StitchSchema.deserialize(data);
  if ("full" in stitch) return new FullStitch(stitch.full);
  if ("part" in stitch) return new PartStitch(stitch.part);
  if ("line" in stitch) return new LineStitch(stitch.line);
  if ("node" in stitch) return new NodeStitch(stitch.node);
  throw new Error("Invalid stitch variant");
}

export function serializeStitch(stitch: Stitch) {
  if (stitch instanceof FullStitch) return StitchSchema.serialize({ full: stitch });
  if (stitch instanceof PartStitch) return StitchSchema.serialize({ part: stitch });
  if (stitch instanceof LineStitch) return StitchSchema.serialize({ line: stitch });
  if (stitch instanceof NodeStitch) return StitchSchema.serialize({ node: stitch });
  throw new Error("Invalid stitch variant");
}
