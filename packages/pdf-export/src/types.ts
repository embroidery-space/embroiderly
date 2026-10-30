export interface CompilationOutput<T> {
  output: T | null;
  diagnostics: Diagnostic[];
}

export interface Diagnostic {
  from: number;
  to: number;
  severity: DiagnosticSeverity;
  message: string;
}

export type DiagnosticSeverity = "error" | "warning";
