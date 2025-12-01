/* eslint-disable no-console */
import { LogLevel, log } from "@embroiderly/tauri-plugin-log";

/** A service for logging messages to the console and the backend. */
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
