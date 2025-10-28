import { PatternEditorPage } from "../shared/pages/";

describe("Pattern Creation", () => {
  it("creates a new pattern with default fabric settings", async () => {
    await PatternEditorPage.createDefaultPattern();

    // Verify that the pattern was created by checking if the canvas is visible.
    await expect($("canvas")).toBeDisplayed();
  });
});
