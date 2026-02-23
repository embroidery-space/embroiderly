export interface Eq<T = unknown> {
  /** Checks if this value is equal to another value. */
  eq(other: T): boolean;
}
