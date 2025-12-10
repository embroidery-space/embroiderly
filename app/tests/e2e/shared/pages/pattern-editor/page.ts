import { ConfirmDialog, FabricModal, PatternInfoModal, GridModal } from "./modals";

/** Page object for the _Pattern Editor_ page. */
class PatternEditorPage {
  confirmDialog = new ConfirmDialog();

  patternInfoModal = new PatternInfoModal();
  fabricModal = new FabricModal();
  gridModal = new GridModal();

  /** Returns a button that triggers the _File_ dropdown menu. */
  get fileMenuButton() {
    return $(`button*=File`);
  }

  /** Returns a button within the _File_ dropdown menu that opens the _Fabric Properties_ modal. */
  get fileCreateMenuItem() {
    return $(`//div[@role="menuitem"][contains(., "Create")]`);
  }

  /** Returns a button that triggers the _Pattern_ dropdown menu. */
  get patternMenuButton() {
    return $(`button*=Pattern`);
  }

  /** Returns a button within the _Pattern_ dropdown menu that opens the _Pattern Info_ modal. */
  get patternInfoMenuItem() {
    return $(`//div[@role="menuitem"][contains(., "Pattern Information")]`);
  }

  /** Returns a button within the _Pattern_ dropdown menu that opens the _Fabric Properties_ modal. */
  get patternFabricMenuItem() {
    return $(`//div[@role="menuitem"][contains(., "Fabric Properties")]`);
  }

  /** Returns a button within the _Pattern_ dropdown menu that opens the _Grid Properties_ modal. */
  get patternGridMenuItem() {
    return $(`//div[@role="menuitem"][contains(., "Grid Properties")]`);
  }

  /** Returns the canvas element. */
  get canvas() {
    return $(`canvas`);
  }

  /** Returns the welcome panel (shown when no pattern is opened). */
  get welcomeScreen() {
    return $(`[data-testid="welcome-screen"]`);
  }

  /**
   * Creates a new pattern with default fabric settings.
   * This is a convenience method that opens the _File_ menu, clicks _Create_ menu item, and saves the default fabric settings.
   */
  async createDefaultPattern() {
    await this.openCreatePatternDialog();
    await this.fabricModal.save();
  }

  /**
   * Opens the _File_ menu and clicks the _Create_ menu item.
   * The _Fabric Properties_ modal will be displayed after this.
   */
  async openCreatePatternDialog() {
    await this.fileMenuButton.click();
    await this.fileCreateMenuItem.click();
  }

  /**
   * Opens the _Pattern_ menu and clicks the _Pattern Info_ menu item.
   * The _Pattern Info_ modal will be displayed after this.
   */
  async openPatternInfoDialog() {
    await this.patternMenuButton.click();
    await this.patternInfoMenuItem.click();
  }

  /**
   * Opens the _Pattern_ menu and clicks the _Fabric Properties_ menu item.
   * The _Fabric Properties_ modal will be displayed after this.
   */
  async openFabricPropertiesDialog() {
    await this.patternMenuButton.click();
    await this.patternFabricMenuItem.click();
  }

  /**
   * Opens the _Pattern_ menu and clicks the _Grid Properties_ menu item.
   * The _Grid Properties_ modal will be displayed after this.
   */
  async openGridPropertiesDialog() {
    await this.patternMenuButton.click();
    await this.patternGridMenuItem.click();
  }

  /** All pattern tabs. */
  get tabs() {
    return $$(`//div[@role="tablist"]//button[@role="tab"]`);
  }

  /** Clicks a pattern tab by index (0-based). */
  async clickTab(index: number) {
    await this.tabs[index].click();
  }

  /** Returns the text of a pattern tab by index (0-based). */
  getTabText(index: number) {
    // For some reason, the `.getText()` method always returns an empty string.
    return this.tabs[index].$(".//span").getHTML({ includeSelectorTag: false });
  }

  /** An active pattern tab. */
  get activeTab() {
    return $(`//div[@role="tablist"]//button[@role="tab"][@aria-selected="true"]`);
  }

  /** Clicks an active pattern tab. */
  async clickActiveTab() {
    await this.activeTab.click();
  }

  /** Returns the text of an active pattern tab. */
  getActiveTabText() {
    // For some reason, the `.getText()` method always returns an empty string.
    return this.activeTab.$(".//span").getHTML({ includeSelectorTag: false });
  }

  /** Clicks the close button on a pattern tab by index (0-based). */
  async closeTab(index: number) {
    // Each tab contains a nested button with a "close" icon.
    await this.tabs[index].$(".//button").click();
  }

  /**
   * Closes all opened patterns without saving changes.
   * This is a utility method for test cleanup and ensuring a clean state.
   * If patterns have unsaved changes, it will automatically reject the save dialog.
   */
  async forceCloseAllPatterns() {
    // Keep closing patterns until none remain.
    while (true) {
      if ((await this.tabs.length) === 0) break;

      await this.closeTab(0);

      // Proceed without saving changes if there any.
      try {
        await this.confirmDialog.modal.waitForDisplayed({ timeout: 1000 });
        await this.confirmDialog.reject();
      } catch {
        // No dialog appeared.
      }
    }

    // Verify welcome panel is displayed.
    await this.welcomeScreen.waitForDisplayed();
  }
}

export default new PatternEditorPage();
