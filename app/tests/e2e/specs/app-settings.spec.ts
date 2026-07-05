import { PatternEditorPage, ConfirmDialog } from "../shared/";

describe("App Settings", () => {
  before(() => PatternEditorPage.forceCloseAllPatterns());

  describe("opening the settings modal", () => {
    afterEach(() => PatternEditorPage.settingsModal.close());

    it("opens via the Manage menu", async () => {
      await PatternEditorPage.settingsModal.openViaManageMenu();
      await expect(PatternEditorPage.settingsModal.modal).toBeDisplayed();
    });

    it("opens via the Ctrl+Comma shortcut", async () => {
      await PatternEditorPage.settingsModal.openViaShortcut();
      await expect(PatternEditorPage.settingsModal.modal).toBeDisplayed();
    });
  });

  describe("tab switching", () => {
    before(() => PatternEditorPage.settingsModal.openViaShortcut());
    after(() => PatternEditorPage.settingsModal.close());

    for (const tab of ["Interface", "Startup", "Working Area", "Updater", "Telemetry", "Other"]) {
      it(`switches to the "${tab}" tab`, async () => {
        await PatternEditorPage.settingsModal.switchTab(tab);

        const tabElement = PatternEditorPage.settingsModal.getTab(tab);
        await expect(tabElement).toHaveAttribute("aria-selected", "true");
      });
    }
  });

  describe("visual changes", () => {
    before(() => PatternEditorPage.settingsModal.openViaShortcut());
    after(() => PatternEditorPage.settingsModal.close());

    it("applies the dark theme", async () => {
      await PatternEditorPage.settingsModal.selectTheme("Dark");
      await expect(browser).toMatchFullPageSnapshot("settings-dark-theme");

      // Restore to default.
      await PatternEditorPage.settingsModal.selectTheme("System");
    });

    it("applies the light theme", async () => {
      await PatternEditorPage.settingsModal.selectTheme("Light");
      await expect(browser).toMatchFullPageSnapshot("settings-light-theme");

      // Restore to default.
      await PatternEditorPage.settingsModal.selectTheme("System");
    });

    it("applies a different scale", async () => {
      await PatternEditorPage.settingsModal.selectScale("Larger");
      await expect(browser).toMatchFullPageSnapshot("settings-larger-scale");

      // Restore to default.
      await PatternEditorPage.settingsModal.selectScale("Medium");
    });

    it("applies the Ukrainian language", async () => {
      await PatternEditorPage.settingsModal.selectLanguage("Українська");
      await expect(browser).toMatchFullPageSnapshot("settings-ukrainian-language");

      // Restore to default.
      await $("aria/Мова").click();
      await $(`//div[@role="option"][normalize-space()="English"]`).click();
    });
  });

  describe("settings reset", () => {
    const settingsResetConfirmDialog = new ConfirmDialog("Settings Reset");

    beforeEach(() => PatternEditorPage.settingsModal.openViaShortcut());
    afterEach(() => PatternEditorPage.settingsModal.close());

    it("resets settings to defaults after confirmation", async () => {
      // Change theme to Dark.
      await PatternEditorPage.settingsModal.selectTheme("Dark");
      await expect(PatternEditorPage.settingsModal.themeSelect).toHaveText("Dark");

      // Click _Reset to defaults_ and confirm.
      await PatternEditorPage.settingsModal.clickResetToDefaults();
      await expect(settingsResetConfirmDialog.modal).toBeDisplayed();
      await settingsResetConfirmDialog.accept();

      // Verify theme reverted to the default value.
      await expect(PatternEditorPage.settingsModal.themeSelect).toHaveText("System");
    });

    it("does not reset when the confirmation is rejected", async () => {
      // Change theme to Dark.
      await PatternEditorPage.settingsModal.selectTheme("Dark");
      await expect(PatternEditorPage.settingsModal.themeSelect).toHaveText("Dark");

      // Click _Reset to defaults_ and reject.
      await PatternEditorPage.settingsModal.clickResetToDefaults();
      await expect(settingsResetConfirmDialog.modal).toBeDisplayed();
      await settingsResetConfirmDialog.reject();

      // Verify theme is unchanged.
      await expect(PatternEditorPage.settingsModal.themeSelect).toHaveText("Dark");

      // Restore to default manually for clean state.
      await PatternEditorPage.settingsModal.selectTheme("System");
    });
  });
});
