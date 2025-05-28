import { invoke as invokeTauriCommand, type InvokeArgs, type InvokeOptions } from "@tauri-apps/api/core";
import { toApplicationError } from "#/error.ts";

export async function invoke<T>(cmd: string, args?: InvokeArgs, options?: InvokeOptions): Promise<T> {
  try {
    return await invokeTauriCommand<T>(cmd, args, options);
  } catch (e) {
    const error = toApplicationError(e);
    globalThis.error(`Error invoking command "${cmd}": ${error.message}`);
    throw error;
  }
}

export * as DisplayApi from "./display";
export * as PatternApi from "./pattern";
export * as PaletteApi from "./palette";
export * as FabricApi from "./fabric";
export * as GridApi from "./grid";
export * as StitchesApi from "./stitches";
export * as HistoryApi from "./history";
export * as PathApi from "./path";
export * as FontsApi from "./fonts";
