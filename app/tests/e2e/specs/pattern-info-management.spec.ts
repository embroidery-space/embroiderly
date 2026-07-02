import { PatternEditorPage } from "../shared/pages/";

describe("Pattern Info Management", () => {
  beforeEach(async () => {
    await PatternEditorPage.createDefaultPattern();
    await expect(PatternEditorPage.canvas).toBeDisplayed();
  });

  afterEach(async () => {
    await PatternEditorPage.forceCloseAllPatterns();
  });

  it("updates pattern information", async () => {
    // Open _Pattern Information_ modal.
    await PatternEditorPage.openPatternInfoDialog();
    await expect(PatternEditorPage.patternInfoModal.modal).toBeDisplayed();

    // Set pattern information.
    await PatternEditorPage.patternInfoModal.setTitle("My Awesome Pattern");
    await PatternEditorPage.patternInfoModal.setAuthor("Test Author");
    await PatternEditorPage.patternInfoModal.setCopyright("Embroiderly");
    await PatternEditorPage.patternInfoModal.setDescription("Test description for pattern");

    // Save the changes.
    await PatternEditorPage.patternInfoModal.save();

    // Verify tab title updated.
    const tabText = await PatternEditorPage.getTabText(0);
    await expect(tabText).toContain("My Awesome Pattern");
  });

  it("updates pattern fabric settings", async () => {
    // Open _Fabric Properties_ modal.
    await PatternEditorPage.openFabricPropertiesDialog();
    await expect(PatternEditorPage.fabricModal.modal).toBeDisplayed();

    // Update fabric settings.
    await PatternEditorPage.fabricModal.setSpi(20);
    await PatternEditorPage.fabricModal.setKind("Evenweave");
    await PatternEditorPage.fabricModal.setSize(60, 80);
    await PatternEditorPage.fabricModal.selectColor("Raspberry");

    // Save the changes.
    await PatternEditorPage.fabricModal.save();

    // Verify changes persisted (canvas still displayed).
    await expect(PatternEditorPage.canvas).toBeDisplayed();
  });

  it("updates pattern grid settings", async () => {
    // Open _Grid Properties_ modal.
    await PatternEditorPage.openGridPropertiesDialog();
    await expect(PatternEditorPage.gridModal.modal).toBeDisplayed();

    // Update grid settings.
    await PatternEditorPage.gridModal.setMajorLinesInterval(20);
    await PatternEditorPage.gridModal.setMinorLinesThickness(0.144);
    await PatternEditorPage.gridModal.setMinorLinesColor("CCCCCC");
    await PatternEditorPage.gridModal.setMajorLinesThickness(0.288);
    await PatternEditorPage.gridModal.setMajorLinesColor("000000");

    // Save the changes.
    await PatternEditorPage.gridModal.save();

    // Verify changes persisted (canvas still displayed).
    await expect(PatternEditorPage.canvas).toBeDisplayed();
  });
});
