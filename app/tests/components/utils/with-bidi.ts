const FSI = "\u2068";
const PDI = "\u2069";

/**
 * Wraps each interpolated value with Fluent's BiDi isolation markers (FSI/PDI), mirroring how Fluent renders placeables at runtime.
 *
 * Component tests query the DOM by visible text, but translated labels in the running app contain First Strong Isolate and Pop Directional Isolate around every placeable.
 * Without these markers, `getByText`, `getByRole({ name })`, and `toHaveTextContent` fail to match.
 * Use this tagged template to author the expected string exactly as Fluent renders it.
 *
 * @example
 * await expect.element(layer).toHaveTextContent(withBidi`Layer ${1}`);
 */
export function withBidi(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce((acc, str, i) => acc + str + (i < values.length ? `${FSI}${values[i]}${PDI}` : ""), "");
}
