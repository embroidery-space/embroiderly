import { invoke } from "./index.ts";
import { Grid } from "#/schemas/index.ts";

export function updateGrid(patternId: string, grid: Grid) {
  return invoke<void>("update_grid", Grid.serialize(grid), { headers: { patternId } });
}
