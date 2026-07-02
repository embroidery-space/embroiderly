import path from "node:path";

import { actions } from "../../utils/actions";
import { $t, LANGUAGES } from "../../utils/i18n";
import { guideDest } from "../../utils/screenshots";
import { prepareSession } from "../../utils/session";

for (const language of LANGUAGES) {
  describe(`Embroiderly Screenshots (${language}) > Guides > Publishing Patterns`, () => {
    const { openDemoPattern, openPdfExport } = actions(language);

    beforeEach(() => prepareSession({ language }));

    it("PDF Export", async () => {
      await openDemoPattern();
      await openPdfExport();

      await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "pdf-export")}"]]`).saveScreenshot(
        path.join(guideDest(language, "publishing-patterns"), "pdf-export-modal.png"),
      );
    });
  });
}
