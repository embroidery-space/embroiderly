import { invoke } from "./index.ts";
import { Fabric } from "~/core/pattern/";

export function updateFabric(patternId: string, fabric: Fabric) {
  return invoke<void>("update_fabric", Fabric.serialize(fabric), { headers: { patternId } });
}
