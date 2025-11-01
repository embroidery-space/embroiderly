import { Fabric, deserializeFabricColors } from "~/core/pattern/";
import type { FabricColor } from "~/core/pattern/";

import { invoke } from "./index.ts";

export function updateFabric(patternId: string, fabric: Fabric) {
  return invoke<void>("update_fabric", Fabric.serialize(fabric), { headers: { patternId } });
}

export async function loadFabricColors(): Promise<FabricColor[]> {
  const buffer = await invoke<ArrayBuffer>("load_fabric_colors");
  return deserializeFabricColors(new Uint8Array(buffer));
}
