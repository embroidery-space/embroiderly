import { FontsApi } from "#/api";
import { DOMAdapter, ExtensionType, LoaderParserPriority, type LoaderParser } from "pixi.js";

export const STITCH_FONT_PREFIX = "stitch-font/";

/** A loader plugin for handling local stitch fonts. */
export const StitchFontsLoader: LoaderParser = {
  id: "stitch-fonts-loader",
  name: "StitchFontsLoader",
  extension: { type: ExtensionType.LoadParser, priority: LoaderParserPriority.High },

  test(url: string) {
    return url.includes(STITCH_FONT_PREFIX);
  },

  async load(url: string) {
    // From `http://localhost:1420/stitch-font/CrossStitch3` to `CrossStitch3`.
    const name = url.split(STITCH_FONT_PREFIX)[1]!;
    try {
      const content = await FontsApi.loadStitchFont(name);
      const fontFace = new FontFace(name, content);
      DOMAdapter.get().getFontFaceSet()!.add(fontFace);
    } catch {
      warn(`Unsupported stitch font: ${name}`);
    }
  },
};
