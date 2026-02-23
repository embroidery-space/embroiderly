export interface Clone<T = unknown> {
  /** Returns a copy of the value. */
  clone(): T;
}
