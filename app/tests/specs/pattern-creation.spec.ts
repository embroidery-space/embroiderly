import { PatternEditorPage } from "../shared/pages/";

describe("Pattern Creation", () => {
  beforeEach(async () => {
    await browser.setWindowSize(1920, 1080);
  });

  it("creates a new pattern with default fabric settings", async () => {
    await expect(browser).toMatchFullPageSnapshot("welcome-page");
    await PatternEditorPage.createDefaultPattern();

    // Verify that the pattern was created by checking if the canvas is visible.
    await expect($("canvas")).toBeDisplayed();
    await expect(browser).toMatchFullPageSnapshot("default-pattern");
  });
});
