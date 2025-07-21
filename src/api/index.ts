import { invoke as invokeTauriCommand, type InvokeArgs, type InvokeOptions } from "@tauri-apps/api/core";
import { toApplicationError } from "#/error.ts";

export async function invoke<T>(cmd: string, args?: InvokeArgs, options?: InvokeOptions): Promise<T> {
  try {
    return await invokeTauriCommand<T>(cmd, args, options);
  } catch (e) {
    throw toApplicationError(e);
  }
}

export * as DisplayApi from "./display.ts";
export * as PatternApi from "./pattern.ts";
export * as ImageApi from "./image.ts";
export * as PaletteApi from "./palette.ts";
export * as FabricApi from "./fabric.ts";
export * as GridApi from "./grid.ts";
export * as StitchesApi from "./stitches.ts";
export * as PublishApi from "./publish.ts";
export * as HistoryApi from "./history.ts";
export * as PathApi from "./path.ts";
export * as FontsApi from "./fonts.ts";
export * as SystemApi from "./system.ts";
