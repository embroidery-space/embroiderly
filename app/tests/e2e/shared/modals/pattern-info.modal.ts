import { BaseModal } from "./core/base.modal";

/** Page object for the _Pattern Info_ modal. */
export class PatternInfoModal extends BaseModal {
  constructor() {
    super(`//div[@role="dialog"][.//h2[text()="Pattern Information"]]`);
  }

  /** Opens the Pattern Info modal by clicking Pattern -> Pattern Information. */
  async open() {
    await $(`button*=Pattern`).click();
    await $(`//div[@role="menuitem"][contains(., "Pattern Information")]`).click();
    await this.modal.waitForDisplayed();
  }

  get titleInput() {
    return this.modal.$(`[data-testid="pattern-title-input"]`);
  }

  /** Sets the pattern title. */
  async setTitle(title: string) {
    await this.titleInput.setValue(title);
  }

  get authorInput() {
    return this.modal.$(`[data-testid="pattern-author-input"]`);
  }

  /** Sets the pattern author. */
  async setAuthor(author: string) {
    await this.authorInput.setValue(author);
  }

  get copyrightInput() {
    return this.modal.$(`[data-testid="pattern-copyright-input"]`);
  }

  /** Sets the pattern copyright. */
  async setCopyright(copyright: string) {
    await this.copyrightInput.setValue(copyright);
  }

  get descriptionTextarea() {
    return this.modal.$(`[data-testid="pattern-description-textarea"]`);
  }

  /** Sets the pattern description. */
  async setDescription(description: string) {
    await this.descriptionTextarea.setValue(description);
  }
}
