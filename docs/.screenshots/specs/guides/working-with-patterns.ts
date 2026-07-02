import path from "node:path";

import sharp from "sharp";

import { actions } from "../../utils/actions";
import { $t, LANGUAGES } from "../../utils/i18n";
import { guideDest } from "../../utils/screenshots";
import { prepareSession } from "../../utils/session";

for (const language of LANGUAGES) {
  describe(`Embroiderly Screenshots (${language}) > Guides > Working with Patterns`, () => {
    const { openDemoPattern, openSettings, openCanvasPanel } = actions(language);

    beforeEach(() => prepareSession({ language }));

    it("Workarea Settings", async () => {
      await openSettings();

      await $(`button*=${$t(language, "settings-workarea")}`).click();

      await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "settings")}"]]`).saveScreenshot(
        path.join(guideDest(language, "working-with-patterns"), "workarea-settings.png"),
      );
    });

    it("Tool Color Setting", async () => {
      await openSettings();

      await $(`button*=${$t(language, "settings-other")}`).click();

      const checkbox = await $(`aria/${$t(language, "settings-use-palitem-color-for-stitch-tools")}`);
      await browser.execute((el) => el.focus({ focusVisible: true }), checkbox);

      await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "settings")}"]]`).saveScreenshot(
        path.join(guideDest(language, "working-with-patterns"), "tool-color-setting.png"),
      );
    });

    it("Zoom Controls", async () => {
      await openDemoPattern();

      await $(`//div[input[@role="spinbutton"]]/following-sibling::button[1]`).click();
      await $("[data-reka-menu-content]").waitForDisplayed();

      const screen = (await browser.saveFullPageScreen("guide-working-with-patterns-zoom-controls")) as {
        fileName: string;
        path: string;
      };
      await sharp(path.join(screen.path, screen.fileName))
        .extract({ left: 1920 - 600, top: 1080 - 300, width: 600, height: 300 })
        .toFile(path.join(guideDest(language, "working-with-patterns"), "zoom-controls.png"));
    });

    it("Canvas Panel", async () => {
      await openDemoPattern();
      await openCanvasPanel();

      await $(`div[data-tour="canvas-panel"]`).saveScreenshot(
        path.join(guideDest(language, "working-with-patterns"), "canvas-panel.png"),
      );
    });
  });
}
