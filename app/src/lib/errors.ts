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
      case "PatternNotFound":
        return new PatternNotFoundError(message);
      case "UnsupportedPatternType":
        return new UnsupportedPatternTypeError(message);
      case "FailedToParse":
        return new FailedToParseError(message);
      case "UnsavedChanges":
        return new UnsavedChangesError(message);
      case "NoFileHandle":
        return new NoFileHandleError(message);
      default:
        return new UnknownError(message);
    }
  }

  return new Error(String(error));
}

export class PatternNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PatternNotFoundError";
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

export class UnsavedChangesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsavedChangesError";
  }
}

export class NoFileHandleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoFileHandleError";
  }
}

export class UnknownError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnknownError";
  }
}
