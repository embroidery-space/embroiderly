import { PatternEditorPage } from "../shared/pages/";

describe("Pattern File Management", () => {
  before(async () => {
    await browser.setWindowSize(1920, 1080);
  });

  afterEach(async () => {
    await PatternEditorPage.forceCloseAllPatterns();
  });

  it("creates a new pattern with default fabric settings", async () => {
    await PatternEditorPage.createDefaultPattern();

    // Verify that the pattern was created by checking if the canvas is visible.
    await expect(PatternEditorPage.canvas).toBeDisplayed();
  });

  it("creates a new pattern with custom fabric settings", async () => {
    // Open the _Create Pattern_ dialog.
    await PatternEditorPage.openCreatePatternDialog();
    await expect(PatternEditorPage.fabricModal.modal).toBeDisplayed();

    // Set custom fabric properties.
    await PatternEditorPage.fabricModal.setSpi(18);
    await PatternEditorPage.fabricModal.setKind("Linen");
    await PatternEditorPage.fabricModal.setSize(60, 80);
    await PatternEditorPage.fabricModal.selectColor("French Blue");

    // Save the fabric settings.
    await PatternEditorPage.fabricModal.save();

    // Verify that the pattern was created.
    await expect(PatternEditorPage.canvas).toBeDisplayed();
  });

  it("creates two patterns and switches between them", async () => {
    // Create first pattern.
    await PatternEditorPage.createDefaultPattern();
    await expect(PatternEditorPage.canvas).toBeDisplayed();

    // Verify first tab exists and shows "Untitled".
    await expect(PatternEditorPage.tabs).toBeElementsArrayOfSize(1);
    await expect(await PatternEditorPage.getTabText(0)).toContain("Untitled");

    // Create second pattern.
    await PatternEditorPage.createDefaultPattern();

    // Verify two tabs exist.
    await expect(PatternEditorPage.tabs).toBeElementsArrayOfSize(2);

    // Click first tab and verify switch.
    await PatternEditorPage.clickTab(0);
    await expect(await PatternEditorPage.getActiveTabText()).toContain("Untitled");

    // Click second tab and verify switch.
    await PatternEditorPage.clickTab(1);
    await expect(await PatternEditorPage.getActiveTabText()).toContain("Untitled");
  });

  it("closes a pattern with unsaved changes after confirmation", async () => {
    // Create default pattern.
    await PatternEditorPage.createDefaultPattern();
    await expect(PatternEditorPage.canvas).toBeDisplayed();
    await expect(PatternEditorPage.welcomeScreen).not.toBeDisplayedInViewport();

    // Make changes to the pattern (update fabric).
    await PatternEditorPage.openFabricPropertiesDialog();
    await PatternEditorPage.fabricModal.selectColor("Cream");
    await PatternEditorPage.fabricModal.save();

    // Try to close the pattern and cancel closing.
    await PatternEditorPage.closeTab(0);
    await expect(PatternEditorPage.confirmDialog.modal).toBeDisplayed();
    await PatternEditorPage.confirmDialog.dismiss();

    // Verify pattern is still open.
    await expect(PatternEditorPage.canvas).toBeDisplayed();
    await expect(PatternEditorPage.tabs).toBeElementsArrayOfSize(1);

    // Try again and proceed without saving changes.
    await PatternEditorPage.closeTab(0);
    await expect(PatternEditorPage.confirmDialog.modal).toBeDisplayed();
    await PatternEditorPage.confirmDialog.reject();

    // Verify pattern is closed and welcome panel is visible.
    await expect(PatternEditorPage.canvas).not.toBeDisplayedInViewport();
    await expect(PatternEditorPage.welcomeScreen).toBeDisplayedInViewport();
  });
});
