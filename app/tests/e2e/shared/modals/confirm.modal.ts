import { BaseModal } from "./core/base.modal";

/** Page object for the _Confirm Dialog_ modal. */
export class ConfirmDialog extends BaseModal {
  constructor(title = "Unsaved Changes") {
    super(`//div[@role="alertdialog"][.//h2[text()="${title}"]]`, { save: "Yes", cancel: "No" });
  }

  /** ConfirmDialog cannot be opened directly. */
  open(): void {
    throw new Error(
      "ConfirmDialog cannot be opened directly; it is triggered by user actions that prompt for confirmation.",
    );
  }

  /** Dismisses the modal without taking any action. */
  async dismiss() {
    await this.modal.$("button").click();
    await this.modal.waitForDisplayed({ reverse: true });
  }

  /** Alias for `cancel()` - rejects the action (the _No_ option). */
  async reject() {
    await this.cancel();
  }

  /** Alias for `save()` - accepts the action (the _Yes_ option). */
  async accept() {
    await this.save();
  }
}
