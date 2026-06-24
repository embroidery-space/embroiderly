import path from "node:path";

import { actions } from "../../utils/actions";
import { $t, LANGUAGES } from "../../utils/i18n";
import { guideDest } from "../../utils/screenshots";
import { prepareSession } from "../../utils/session";

for (const language of LANGUAGES) {
  describe(`Embroiderly Screenshots (${language}) > Guides > Importing Images`, () => {
    const { openImageImport } = actions(language);

    beforeEach(() => prepareSession(language));

    it("Image Import", async () => {
      await openImageImport();

      await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "image-import")}"]]`).saveScreenshot(
        path.join(guideDest(language, "importing-images"), "image-import-modal.png"),
      );
    });
  });
}
