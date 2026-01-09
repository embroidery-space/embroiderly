/* eslint-disable no-console */

import { invoke } from "@tauri-apps/api/core";

import StackTracey from "stacktracey";

const enum LogLevel {
  Error = "error",
  Warn = "warn",
  Info = "info",
  Debug = "debug",
  Trace = "trace",
}

async function log(level: LogLevel, message: string) {
  const location = getCallerLocation(new Error(message).stack);
  return invoke<void>("plugin:log|log", { level, message, location });
}

function getCallerLocation(stack?: string) {
  if (!stack) return;

  const entry = new StackTracey(stack).items[2]; // Get the third entry which is the main caller.
  if (!entry) return;

  return `${entry.callee || "<anonymous>"}@${entry.fileName}:${entry.line}:${entry.column}`;
}

class LoggerServiceClass {
  error(message: string) {
    console.error(message);
    return log(LogLevel.Error, message);
  }

  warn(message: string) {
    console.warn(message);
    return log(LogLevel.Warn, message);
  }

  info(message: string) {
    console.info(message);
    return log(LogLevel.Info, message);
  }

  debug(message: string) {
    console.debug(message);
    return log(LogLevel.Debug, message);
  }

  trace(message: string) {
    console.trace(message);
    return log(LogLevel.Trace, message);
  }
}
export const LoggerService = new LoggerServiceClass();
