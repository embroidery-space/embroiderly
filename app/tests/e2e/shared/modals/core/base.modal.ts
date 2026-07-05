export interface ModalControls {
  /**
   * Label for the _Save_ button.
   * @default "Save"
   */
  save?: string;
  /**
   * Label for the _Cancel_ button.
   * @default "Cancel"
   */
  cancel?: string;
}

const DEFAULT_CONTROLS: ModalControls = {
  save: "Save",
  cancel: "Cancel",
};

/** Base class for modal objects. */
export abstract class BaseModal {
  protected modalSelector: string;
  protected controls: ModalControls;

  constructor(modalSelector: string, controls?: ModalControls) {
    this.modalSelector = modalSelector;
    this.controls = { ...DEFAULT_CONTROLS, ...controls };
  }

  /** Returns the modal element. */
  get modal() {
    return $(this.modalSelector);
  }

  /** Opens the modal. Must be implemented by subclasses. */
  abstract open(): void | Promise<void>;

  /** Closes the modal via the close button. */
  async close() {
    await this.modal.$(`aria/Close`).click();
    await this.modal.waitForDisplayed({ reverse: true });
  }

  /** Clicks the _Save_ button and waits for modal to close. */
  async save() {
    await this.modal.$(`button*=${this.controls.save}`).click();
    await this.modal.waitForDisplayed({ reverse: true });
  }

  /** Clicks the _Cancel_ button and waits for modal to close. */
  async cancel() {
    await this.modal.$(`button*=${this.controls.cancel}`).click();
    await this.modal.waitForDisplayed({ reverse: true });
  }
}
