/* oxlint-disable no-console */

import { invoke } from "@tauri-apps/api/core";

import StackTracey from "stacktracey";

const enum LogLevel {
  Error = "error",
  Warn = "warn",
  Info = "info",
  Debug = "debug",
  Trace = "trace",
}

export interface LogOptions {
  /** When provided, skips the JS-stack walk. Mainly used by the Wasm module. */
  location?: string;
}

function getCallerLocation(stack?: string) {
  if (!stack) return;

  const entry = new StackTracey(stack).items[2]; // Get the third entry which is the main caller.
  if (!entry) return;

  return `${entry.callee || "<anonymous>"}@${entry.fileName}:${entry.line}:${entry.column}`;
}

export class LoggerServiceClass {
  /** Generic entry point for callers that only have the level as a string (e.g. the Wasm module). */
  log(level: string, message: string, options?: LogOptions) {
    this.#dispatch(level.toLowerCase() as LogLevel, message, options);
  }

  error(message: string, options?: LogOptions) {
    this.#dispatch(LogLevel.Error, message, options);
  }

  warn(message: string, options?: LogOptions) {
    this.#dispatch(LogLevel.Warn, message, options);
  }

  info(message: string, options?: LogOptions) {
    this.#dispatch(LogLevel.Info, message, options);
  }

  debug(message: string, options?: LogOptions) {
    this.#dispatch(LogLevel.Debug, message, options);
  }

  trace(message: string, options?: LogOptions) {
    this.#dispatch(LogLevel.Trace, message, options);
  }

  #dispatch(level: LogLevel, message: string, options?: LogOptions) {
    console[level](message);

    if (__TAURI__) {
      const location = options?.location ?? getCallerLocation(new Error().stack);
      void invoke("plugin:log|log", { level: level.toUpperCase(), message, location });
    }
  }
}
export const LoggerService = new LoggerServiceClass();
