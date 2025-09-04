/* eslint-disable no-console */
import { LogLevel, log } from "@embroiderly/tauri-plugin-log";

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
    return log(LogLevel.Error, message);
  };
  globalThis.warn = async (message) => {
    console.warn(message);
    return log(LogLevel.Warn, message);
  };
  globalThis.info = async (message) => {
    console.info(message);
    return log(LogLevel.Info, message);
  };
  globalThis.debug = async (message) => {
    console.debug(message);
    return log(LogLevel.Debug, message);
  };
  globalThis.trace = async (message) => {
    console.trace(message);
    return log(LogLevel.Trace, message);
  };
}
