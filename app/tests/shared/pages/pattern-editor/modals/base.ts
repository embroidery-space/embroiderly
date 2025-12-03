/** Base class for modal objects. */
export class BaseModal {
  protected modalSelector: string;

  constructor(modalSelector: string) {
    this.modalSelector = modalSelector;
  }

  /** Returns the modal element. */
  get modal() {
    return $(this.modalSelector);
  }

  /** Returns the overlay element. */
  get overlay() {
    return $(`[data-slot="overlay"]`);
  }

  /** Clicks the _Save_ button and waits for modal to close. */
  async save() {
    await this.modal.$("button*=Save").click();
    await this.modal.waitForDisplayed({ reverse: true });
    await this.overlay.waitForDisplayed({ reverse: true });
  }

  /** Clicks the _Cancel_ button and waits for modal to close. */
  async cancel() {
    await this.modal.$("button*=Cancel").click();
    await this.modal.waitForDisplayed({ reverse: true });
    await this.overlay.waitForDisplayed({ reverse: true });
  }
}
