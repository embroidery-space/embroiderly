import { readFile } from "node:fs/promises";
import { defineConfig, presetIcons, presetWind3 } from "unocss";
import { FileSystemIconLoader } from "@iconify/utils/lib/loader/node-loaders";

export default defineConfig({
  presets: [
    presetWind3({ dark: "media" }),
    presetIcons({
      scale: 1.5,
      unit: "rem",
      collections: {
        stitches: FileSystemIconLoader("./src/assets/icons/stitches"),
        "window-controls": FileSystemIconLoader("./src/assets/icons/window-controls"),
      },
    }),
  ],
  preflights: [
    // Import custom CSS files here to include them into the optimization process.
    { getCSS: () => readFile("src/assets/reset.css", "utf-8"), layer: "base" },
    { getCSS: () => readFile("src/assets/utilities.css", "utf-8"), layer: "utilities" },
  ],
  outputToCssLayers: {
    cssLayerName(layer) {
      switch (layer) {
        case "preflights": {
          return "base";
        }
        case "default": {
          return "utilities";
        }
        default: {
          return layer;
        }
      }
    },
  },
});
