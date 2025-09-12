import { invoke } from "./index.ts";
import { Grid } from "~/core/pattern/";

export function updateGrid(patternId: string, grid: Grid) {
  return invoke<void>("update_grid", Grid.serialize(grid), { headers: { patternId } });
}
