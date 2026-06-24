import path from "node:path";

import { actions } from "../utils/actions";
import { LANGUAGES } from "../utils/i18n";
import { dualThemeScreenshot, overviewDest } from "../utils/screenshots";
import { prepareSession } from "../utils/session";

for (const language of LANGUAGES) {
  describe(`Embroiderly Screenshots (${language}) > Overview`, () => {
    const {
      openDemoPattern,
      enterPaletteEditingMode,
      openPatternInfo,
      openFabricProperties,
      openGridProperties,
      openPdfExport,
      openImageImport,
    } = actions(language);

    beforeEach(() => prepareSession(language));

    it("Welcome Screen", async () => {
      await dualThemeScreenshot("overview-welcome-screen", path.join(overviewDest(language), "welcome-screen.png"));
    });

    it("Pattern Editor", async () => {
      await openDemoPattern();
      await dualThemeScreenshot("overview-pattern-editor", path.join(overviewDest(language), "pattern-editor.png"));
    });

    it("Palette Editing", async () => {
      await openDemoPattern();
      await dualThemeScreenshot(
        "overview-palette-editing",
        path.join(overviewDest(language), "palette-editing.png"),
        enterPaletteEditingMode,
      );
    });

    it("Pattern Info", async () => {
      await openDemoPattern();
      await dualThemeScreenshot(
        "overview-pattern-info",
        path.join(overviewDest(language), "pattern-info.png"),
        openPatternInfo,
      );
    });

    it("Fabric Properties", async () => {
      await openDemoPattern();
      await dualThemeScreenshot(
        "overview-fabric-properties",
        path.join(overviewDest(language), "fabric-properties.png"),
        openFabricProperties,
      );
    });

    it("Grid Properties", async () => {
      await openDemoPattern();
      await dualThemeScreenshot(
        "overview-grid-properties",
        path.join(overviewDest(language), "grid-properties.png"),
        openGridProperties,
      );
    });

    it("PDF Export", async () => {
      await openDemoPattern();
      await dualThemeScreenshot(
        "overview-pdf-export",
        path.join(overviewDest(language), "pdf-export.png"),
        openPdfExport,
      );
    });

    it("Image Import", async () => {
      await dualThemeScreenshot(
        "overview-image-import",
        path.join(overviewDest(language), "image-import.png"),
        openImageImport,
      );
    });
  });
}
