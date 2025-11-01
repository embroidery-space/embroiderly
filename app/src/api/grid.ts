import { Grid } from "~/core/pattern/";

import { invoke } from "./index.ts";

export function updateGrid(patternId: string, grid: Grid) {
  return invoke<void>("update_grid", Grid.serialize(grid), { headers: { patternId } });
}
