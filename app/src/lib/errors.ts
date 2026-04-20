interface ApplicationError {
  kind: string;
  message: string;
}

export function toApplicationError(error: unknown): Error {
  if (error instanceof Error) return error;

  const isApplicationError = typeof error === "object" && error !== null && "kind" in error && "message" in error;
  if (isApplicationError) {
    const { kind, message } = error as ApplicationError;
    switch (kind) {
      case "InvalidRequestBody":
        return new InvalidRequestBodyError(message);
      case "MissingPatternIdHeader":
        return new MissingPatternIdHeaderError(message);
      case "PatternNotFound":
        return new PatternNotFoundError(message);
      case "BackupFileExists":
        return new BackupFileExistsError(message);
      case "UnsupportedPatternType":
        return new UnsupportedPatternTypeError(message);
      case "FailedToParse":
        return new FailedToParseError(message);
      case "UnsavedChanges":
        return new UnsavedChangesError(message);
      case "FailedToExport":
        return new FailedToExportError(message);
      case "FailedToImport":
        return new FailedToImportError(message);
      default:
        return new UnknownError(message);
    }
  }

  return new Error(String(error));
}

export class InvalidRequestBodyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRequestBodyError";
  }
}

export class MissingPatternIdHeaderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingPatternIdHeaderError";
  }
}

export class PatternNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PatternNotFoundError";
  }
}

export class BackupFileExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackupFileExistsError";
  }
}

export class UnsupportedPatternTypeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedPatternTypeError";
  }
}

export class FailedToParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FailedToParseError";
  }
}

export class FailedToExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FailedToExportError";
  }
}

export class FailedToImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FailedToImportError";
  }
}

export class UnsavedChangesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsavedChangesError";
  }
}

export class UnknownError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnknownError";
  }
}
