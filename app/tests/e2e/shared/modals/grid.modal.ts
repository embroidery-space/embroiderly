import { BaseModal } from "./core/base.modal";

/** Page object for the _Grid Properties_ modal. */
export class GridModal extends BaseModal {
  constructor() {
    super(`//div[@role="dialog"][.//h2[text()="Grid Properties"]]`);
  }

  /** Opens the Grid Properties modal by clicking Pattern -> Grid Properties. */
  async open() {
    await $(`button*=Pattern`).click();
    await $(`//div[@role="menuitem"][contains(., "Grid Properties")]`).click();
    await this.modal.waitForDisplayed();
  }

  get majorLinesIntervalInput() {
    return this.modal.$(`[data-testid="grid-major-lines-interval-input"]`);
  }

  /** Sets the major lines interval (in stitches). */
  async setMajorLinesInterval(interval: number) {
    await this.majorLinesIntervalInput.setValue(interval);
  }

  get minorLinesThicknessInput() {
    return this.modal.$(`[data-testid="grid-minor-lines-thickness-input"]`);
  }

  /** Sets the minor lines thickness (in points). */
  async setMinorLinesThickness(thickness: number) {
    await this.minorLinesThicknessInput.setValue(thickness);
  }

  get minorLinesColorInput() {
    return this.modal.$(`[data-testid="grid-minor-lines-color-input"]`);
  }

  /** Sets the minor lines color. */
  async setMinorLinesColor(color: string) {
    const value = color.startsWith("#") ? color : `#${color}`;
    await this.minorLinesColorInput.setValue(value);
  }

  get majorLinesThicknessInput() {
    return this.modal.$(`[data-testid="grid-major-lines-thickness-input"]`);
  }

  /** Sets the major lines thickness (in points). */
  async setMajorLinesThickness(thickness: number) {
    await this.majorLinesThicknessInput.setValue(thickness);
  }

  get majorLinesColorInput() {
    return this.modal.$(`[data-testid="grid-major-lines-color-input"]`);
  }

  /** Sets the major lines color. */
  async setMajorLinesColor(color: string) {
    const value = color.startsWith("#") ? color : `#${color}`;
    await this.majorLinesColorInput.setValue(value);
  }
}
