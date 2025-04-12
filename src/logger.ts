/* eslint-disable no-console */
import { warn, debug, trace, info, error, type LogOptions } from "@tauri-apps/plugin-log";

declare global {
  function error(message: string, options?: LogOptions): Promise<void>;
  function warn(message: string, options?: LogOptions): Promise<void>;
  function info(message: string, options?: LogOptions): Promise<void>;
  function debug(message: string, options?: LogOptions): Promise<void>;
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
