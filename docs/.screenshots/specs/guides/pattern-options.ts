import path from "node:path";

import sharp from "sharp";

import { actions } from "../../utils/actions";
import { $t, LANGUAGES } from "../../utils/i18n";
import { guideDest } from "../../utils/screenshots";
import { prepareSession } from "../../utils/session";

for (const language of LANGUAGES) {
  describe(`Embroiderly Screenshots (${language}) > Guides > Pattern Options`, () => {
    const { openDemoPattern, openPatternInfo, openFabricProperties, openGridProperties } = actions(language);

    beforeEach(() => prepareSession({ language }));

    it("Pattern Menu", async () => {
      await openDemoPattern();
      await $(`button*=${$t(language, "app-menu-pattern")}`).click();

      const screen = (await browser.saveFullPageScreen("guide-pattern-options-pattern-menu")) as {
        fileName: string;
        path: string;
      };
      await sharp(path.join(screen.path, screen.fileName))
        .extract({ left: 0, top: 0, width: 600, height: 400 })
        .toFile(path.join(guideDest(language, "pattern-options"), "pattern-menu.png"));
    });

    it("Pattern Info", async () => {
      await openDemoPattern();
      await openPatternInfo();

      await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "pattern-info")}"]]`).saveScreenshot(
        path.join(guideDest(language, "pattern-options"), "pattern-info-modal.png"),
      );
    });

    it("Fabric Properties", async () => {
      await openDemoPattern();
      await openFabricProperties();

      await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "fabric-properties")}"]]`).saveScreenshot(
        path.join(guideDest(language, "pattern-options"), "fabric-modal.png"),
      );
    });

    it("Grid Properties", async () => {
      await openDemoPattern();
      await openGridProperties();

      await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "grid-properties")}"]]`).saveScreenshot(
        path.join(guideDest(language, "pattern-options"), "grid-modal.png"),
      );
    });
  });
}
