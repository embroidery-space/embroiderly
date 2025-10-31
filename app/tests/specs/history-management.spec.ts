import { PatternEditorPage } from "../shared/pages/";

// Accept mismatch at most 1%.
// In tests, undo/redo buttons keep the "pressed" state after the click which causes unwanted failures.
const MISMATCH_PERCENTAGE = 1;

describe("History Management", () => {
  before(async () => {
    await browser.setWindowSize(1920, 1080);
  });

  beforeEach(async () => {
    await PatternEditorPage.createDefaultPattern();
    await expect(PatternEditorPage.canvas).toBeDisplayed();
  });

  afterEach(async () => {
    await PatternEditorPage.forceCloseAllPatterns();
  });

  it("undoes and redoes changes using buttons", async () => {
    // Make a change to the pattern (update fabric color).
    await PatternEditorPage.openFabricPropertiesDialog();
    await PatternEditorPage.fabricModal.selectColor("Christmas Red");
    await PatternEditorPage.fabricModal.save();

    // Take snapshot after change.
    await expect(browser).toMatchFullPageSnapshot("fabric-color-changed", MISMATCH_PERCENTAGE);

    // Click _Undo_ button and verify fabric change was undone.
    await PatternEditorPage.clickUndo();
    await expect(browser).toMatchFullPageSnapshot("new-pattern-with-default-fabric", MISMATCH_PERCENTAGE);

    // Click _Redo_ button and verify fabric change was reapplied.
    await PatternEditorPage.clickRedo();
    await expect(browser).toMatchFullPageSnapshot("fabric-color-changed", MISMATCH_PERCENTAGE);
  });

  it("undoes and redoes changes using keyboard shortcuts", async () => {
    // Make a change to the pattern (update fabric color).
    await PatternEditorPage.openFabricPropertiesDialog();
    await PatternEditorPage.fabricModal.selectColor("Christmas Red");
    await PatternEditorPage.fabricModal.save();

    // Take snapshot after change.
    await expect(browser).toMatchFullPageSnapshot("fabric-color-changed", MISMATCH_PERCENTAGE);

    // Press _Undo_ shortcut and verify fabric change was undone.
    await PatternEditorPage.pressUndoShortcut();
    await expect(browser).toMatchFullPageSnapshot("new-pattern-with-default-fabric", MISMATCH_PERCENTAGE);

    // Press _Redo_ shortcut and verify fabric change was reapplied.
    await PatternEditorPage.pressRedoShortcut();
    await expect(browser).toMatchFullPageSnapshot("fabric-color-changed", MISMATCH_PERCENTAGE);
  });
});
