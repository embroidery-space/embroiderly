import { invoke } from "@tauri-apps/api/core";
import StackTracey from "stacktracey";

export enum LogLevel {
  Error = "error",
  Warn = "warn",
  Info = "info",
  Debug = "debug",
  Trace = "trace",
}

/**
 * Send a log message to the backend.
 * @param level - The log level.
 * @param message - The log message.
 */
export async function log(level: LogLevel, message: string) {
  const location = getCallerLocation(new Error().stack);
  return invoke<void>("plugin:log|log", { level, message, location });
}

function getCallerLocation(stack?: string) {
  if (!stack) return;

  const entry = new StackTracey(stack).items[2]; // Get the third entry which is the main caller.
  if (!entry) return;

  return `${entry.callee || "<anonymous>"}@${entry.fileName}:${entry.line}:${entry.column}`;
}
