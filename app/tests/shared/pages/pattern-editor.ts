/** Page object for the Pattern Editor page. */
class PatternEditorPage {
  /** Returns a button that triggers the _File_ dropdown menu. */
  get fileMenuButton() {
    return $("button*=File");
  }

  /** Returns a button within the _File_ dropdown menu that opens the _Fabric Properties_ model. */
  get fileCreateMenuItem() {
    return $("button*=Create");
  }

  /** Returns the _Fabric Properties_ modal. */
  get fabricPropertiesModal() {
    return $('//div[@role="dialog"][.//h2[text()="Fabric Properties"]]');
  }

  /** Creates a new pattern with default fabric settings. */
  public async createDefaultPattern() {
    // Open the _File_ menu.
    await this.fileMenuButton.click();

    // Click the _Create_ menu item.
    await this.fileCreateMenuItem.waitForDisplayed();
    await this.fileCreateMenuItem.click();

    // Click the _Save_ button to create the pattern.
    await this.fabricPropertiesModal.waitForDisplayed();
    await this.fabricPropertiesModal.$("button*=Save").click();

    // Wait for modal to close.
    await this.fabricPropertiesModal.waitForDisplayed({ reverse: true });
  }
}

export default new PatternEditorPage();
