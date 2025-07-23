/* eslint-disable no-console */
import { warn, debug, trace, info, error, type LogOptions } from "@tauri-apps/plugin-log";

declare global {
  /** Prints an error message in the console and sends it to the logging backend. */
  function error(message: string, options?: LogOptions): Promise<void>;

  /** Prints a warning message in the console and sends it to the logging backend. */
  function warn(message: string, options?: LogOptions): Promise<void>;

  /** Prints an informational message in the console and sends it to the logging backend. */
  function info(message: string, options?: LogOptions): Promise<void>;

  /** Prints a debug message in the console and sends it to the logging backend. */
  function debug(message: string, options?: LogOptions): Promise<void>;

  /** Prints a trace message in the console and sends it to the logging backend. */
  function trace(message: string, options?: LogOptions): Promise<void>;
}

export function initLogger() {
  globalThis.error = (message, options) => {
    console.error(message);
    return error(message, options);
  };
  globalThis.warn = (message, options) => {
    console.warn(message);
    return warn(message, options);
  };
  globalThis.info = (message, options) => {
    console.info(message);
    return info(message, options);
  };
  globalThis.debug = (message, options) => {
    console.debug(message);
    return debug(message, options);
  };
  globalThis.trace = (message, options) => {
    console.trace(message);
    return trace(message, options);
  };
}
