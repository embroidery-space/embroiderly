interface ApplicationError {
  kind: "command" | "pattern" | "tauri" | "io" | "uuid" | "unknown";
  message: string;
}
export function toApplicationError(error: unknown): Error {
  const isApplicationError = typeof error === "object" && error !== null && "kind" in error && "message" in error;
  if (isApplicationError) {
    const err = error as ApplicationError;
    const [code, message] = err.message.split(":").map((s) => s.trim()) as [string, string];

    if (err.kind === "command") {
      if (code === "Err01") return new CommandErrorInvalidRequestBody(message);
      if (code === "Err02") return new CommandErrorMissingPatternIdHeader(message);
    }

    if (err.kind === "pattern") {
      if (code === "Err01") return new PatternErrorPatternNotFound(message);
      if (code === "Err02") return new PatternErrorBackupFileExists(message);
      if (code === "Err03") return new PatternErrorUnsupportedPatternType(message);
      if (code === "Err04") return new PatternErrorUnsupportedPatternTypeForSaving(message);
      if (code === "Err05") return new PatternErrorFailedToParse(message);
      if (code === "Err06") return new PatternErrorUnsavedChanges(message);
    }

    return new UnknownError(err.message);
  } else return error instanceof Error ? error : new Error(String(error));
}

export class CommandErrorInvalidRequestBody extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommandErrorInvalidRequestBody";
  }
}

export class CommandErrorMissingPatternIdHeader extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommandErrorMissingPatternIdHeader";
  }
}

export class PatternErrorPatternNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PatternErrorPatternNotFound";
  }
}

export class PatternErrorBackupFileExists extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PatternErrorBackupFileExists";
  }
}

export class PatternErrorUnsupportedPatternType extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PatternErrorUnsupportedPatternType";
  }
}

export class PatternErrorUnsupportedPatternTypeForSaving extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PatternErrorUnsupportedPatternTypeForSaving";
  }
}

export class PatternErrorFailedToParse extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PatternErrorFailedToParse";
  }
}

export class PatternErrorUnsavedChanges extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PatternErrorUnsavedChanges";
  }
}

export class UnknownError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnknownError";
  }
}
