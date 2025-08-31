/* eslint-disable no-console */
import { invoke } from "@tauri-apps/api/core";
import StackTracey from "stacktracey";

declare global {
  /** Prints an error message in the console and sends it to the logging backend. */
  function error(message: string): Promise<void>;

  /** Prints a warning message in the console and sends it to the logging backend. */
  function warn(message: string): Promise<void>;

  /** Prints an informational message in the console and sends it to the logging backend. */
  function info(message: string): Promise<void>;

  /** Prints a debug message in the console and sends it to the logging backend. */
  function debug(message: string): Promise<void>;

  /** Prints a trace message in the console and sends it to the logging backend. */
  function trace(message: string): Promise<void>;
}

export function initLogger() {
  globalThis.error = async (message) => {
    console.error(message);
    return log("error", message);
  };
  globalThis.warn = async (message) => {
    console.warn(message);
    return log("warn", message);
  };
  globalThis.info = async (message) => {
    console.info(message);
    return log("info", message);
  };
  globalThis.debug = async (message) => {
    console.debug(message);
    return log("debug", message);
  };
  globalThis.trace = async (message) => {
    console.trace(message);
    return log("trace", message);
  };
}

async function log(level: string, message: string) {
  const location = getCallerLocation(new Error().stack);
  return invoke<void>("log", { level, message, location });
}

function getCallerLocation(stack?: string) {
  if (!stack) return;

  const entry = new StackTracey(stack).items[2]; // Get the third entry which is the main caller.
  if (!entry) return;

  return `${entry.callee || "<anonymous>"}@${entry.fileName}:${entry.line}:${entry.column}`;
}
