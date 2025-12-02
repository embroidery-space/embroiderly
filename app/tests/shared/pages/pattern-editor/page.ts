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
  get welcomePanel() {
    return $(`[data-testid="welcome-panel"]`);
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

  /** An active pattern tab. */
  get activeTab() {
    return $(`//div[@role="tablist"]//button[@role="tab"][@aria-selected="true"]`);
  }

  /** Clicks a pattern tab by index (0-based). */
  async clickTab(index: number) {
    await this.tabs[index].click();
  }

  /** Gets the text of a pattern tab by index (0-based). */
  async getTabText(index: number) {
    const tab = this.tabs[index];
    await tab.waitForDisplayed();
    return await tab.getText();
  }

  /** Clicks the close button on a pattern tab by index (0-based). */
  async closeTab(index: number) {
    // Each tab contains a nested button with a "close" icon.
    await this.tabs[index].$(".//button").click();
  }

  /** Returns the Undo button in the header. */
  get undoButton() {
    return $(`[data-testid="undo-button"]`);
  }

  /** Clicks the _Undo_ button. */
  async clickUndo() {
    await this.undoButton.click();
  }

  /** Returns the Redo button in the header. */
  get redoButton() {
    return $(`[data-testid="redo-button"]`);
  }

  /** Clicks the _Redo_ button. */
  async clickRedo() {
    await this.redoButton.click();
  }

  /** Presses keyboard shortcut for _Undo_ (`Ctrl+Z`). */
  async pressUndoShortcut() {
    await browser.keys(["Control", "z"]);
  }

  /** Presses keyboard shortcut for _Redo_ (`Ctrl+Y`). */
  async pressRedoShortcut() {
    await browser.keys(["Control", "y"]);
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
    await this.welcomePanel.waitForDisplayed();
  }
}

export default new PatternEditorPage();
