interface ApplicationError {
  kind: "command" | "parsing" | "tauri" | "io" | "uuid" | "other";
  message: string;
}
export function toApplicationError(error: unknown): Error {
  const isApplicationError = typeof error === "object" && error !== null && "kind" in error && "message" in error;
  if (isApplicationError) {
    const err = error as ApplicationError;
    if (err.kind === "command") {
      if (err.message.startsWith("Err04")) return new ErrorBackupFileExists(err.message);
    }
    if (err.kind === "parsing") {
      if (err.message.startsWith("Err01")) return new ErrorUnsupportedPatternType(err.message);
      if (err.message.startsWith("Err02")) return new ErrorUnsupportedPatternTypeForSaving(err.message);
    }
    return new Error(err.message);
  }
  return error instanceof Error ? error : new Error(String(error));
}

export class ErrorBackupFileExists extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErrorBackupFileExists";
  }
}

export class ErrorUnsupportedPatternType extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErrorUnsupportedPatternType";
  }
}

export class ErrorUnsupportedPatternTypeForSaving extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErrorUnsupportedPatternTypeForSaving";
  }
}
