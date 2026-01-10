import { BaseModal } from "./base";

/** Page object for the _Confirm Dialog_ modal. */
export class ConfirmDialog extends BaseModal {
  constructor() {
    super('//div[@role="dialog"][.//h2[text()="Unsaved Changes"]]');
  }

  override async save() {
    await this.modal.$("button*=Yes").click();
    await this.modal.waitForDisplayed({ reverse: true });
  }

  override async cancel() {
    await this.modal.$("button*=No").click();
    await this.modal.waitForDisplayed({ reverse: true });
  }

  /** Dismisses the modal without taking any action. */
  async dismiss() {
    await this.modal.$("button").click();
    await this.modal.waitForDisplayed({ reverse: true });
  }

  /** Alias for `save()` - accepts the action (the _Yes_ option). */
  async accept() {
    await this.save();
  }

  /** Alias for `cancel()` - rejects the action (the _No_ option). */
  async reject() {
    await this.cancel();
  }
}
