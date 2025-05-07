import { invoke } from "@tauri-apps/api/core";
import { type PatternKey, Grid } from "#/schemas/index.ts";

export function updateGrid(patternKey: PatternKey, grid: Grid) {
  return invoke<void>("update_grid", Grid.serialize(grid), { headers: { patternKey } });
}
