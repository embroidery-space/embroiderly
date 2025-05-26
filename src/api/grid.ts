import { invoke } from "@tauri-apps/api/core";
import { Grid } from "#/schemas/index.ts";

export function updateGrid(patternId: string, grid: Grid) {
  return invoke<void>("update_grid", Grid.serialize(grid), { headers: { patternId } });
}
