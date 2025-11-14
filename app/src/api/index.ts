import { invoke as invokeTauriCommand } from "@tauri-apps/api/core";
import type { InvokeArgs, InvokeOptions } from "@tauri-apps/api/core";

import { toApplicationError } from "~/error.ts";

export async function invoke<T>(cmd: string, args?: InvokeArgs, options?: InvokeOptions): Promise<T> {
  try {
    return await invokeTauriCommand<T>(cmd, args, options);
  } catch (e) {
    throw toApplicationError(e);
  }
}

export * as FilesApi from "./files.ts";
export type * from "./files.ts";

export * as PatternApi from "./pattern.ts";
export type * from "./pattern.ts";

export * as UtilityApi from "./utils.ts";
export type * from "./utils.ts";
