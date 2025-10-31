import { BaseModal } from "./base";

/** Page object for the _Pattern Info_ modal. */
export class PatternInfoModal extends BaseModal {
  constructor() {
    super(`//div[@role="dialog"][.//h2[text()="Pattern Information"]]`);
  }

  get titleInput() {
    return this.modal.$(`[data-testid="pattern-title-input"]`);
  }

  get authorInput() {
    return this.modal.$(`[data-testid="pattern-author-input"]`);
  }

  get copyrightInput() {
    return this.modal.$(`[data-testid="pattern-copyright-input"]`);
  }

  get descriptionTextarea() {
    return this.modal.$(`[data-testid="pattern-description-textarea"]`);
  }

  /** Sets the pattern title. */
  async setTitle(title: string) {
    await this.titleInput.setValue(title);
  }

  /** Sets the pattern author. */
  async setAuthor(author: string) {
    await this.authorInput.setValue(author);
  }

  /** Sets the pattern copyright. */
  async setCopyright(copyright: string) {
    await this.copyrightInput.setValue(copyright);
  }

  /** Sets the pattern description. */
  async setDescription(description: string) {
    await this.descriptionTextarea.setValue(description);
  }
}
