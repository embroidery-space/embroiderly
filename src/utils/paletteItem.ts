import { Blend, PaletteItem, PaletteSettings } from "#/schemas/index.ts";

/**
 * Composes a title for a palette item based on the provided display options.
 *
 * @param palitem The palette item for which the title is composed.
 * @param options The display options to customize the title.
 * @returns The composed title for the palette item.
 */
export function paletteItemTitle(
  palitem: Partial<Pick<PaletteItem, "brand" | "blends" | "number" | "name">>,
  options = PaletteSettings.default(),
): string {
  const components = [];
  if (options.showColorBrands && palitem.brand) components.push(palitem.brand);
  if (palitem.blends?.length) {
    components.push(
      palitem.blends
        .map((blend) => blendTitle(blend, options))
        // Remove empty strings.
        .filter((v) => v.length)
        .join(", "),
    );
    return components.join(": ");
  }
  if (options.showColorNumbers && palitem.number) components.push(palitem.number);
  // The name can be an empty string. For example, if the palette item is blend.
  if (options.showColorNames && palitem.name?.length) {
    if (!components.length) return palitem.name;
    return [components.join(" "), palitem.name].join(", ");
  }
  return components.join(" ");
}

/**
 * Composes a title for a blend based on the provided display options.
 *
 * @param blend - The blend for which the title is composed.
 * @param options - The display options to customize the title.
 * @returns The composed title for the blend.
 */
export function blendTitle({ brand, number }: Blend, options: PaletteSettings): string {
  const components = [];
  if (options.showColorBrands) components.push(brand);
  if (options.showColorNumbers) components.push(number);
  return components.join(" ");
}
