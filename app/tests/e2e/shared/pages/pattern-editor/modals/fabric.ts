import { BaseModal } from "./base";

/** Page object for the _Fabric Properties_ modal. */
export class FabricModal extends BaseModal {
  constructor() {
    super(`//div[@role="dialog"][.//h2[text()="Fabric Properties"]]`);
  }

  get countSelect() {
    return this.modal.$(`[data-testid="fabric-count-select"]`);
  }

  get kindSelect() {
    return this.modal.$(`[data-testid="fabric-kind-select"]`);
  }

  get unitRadioGroup() {
    return this.modal.$(`[data-testid="fabric-unit-radio-group"]`);
  }

  getUnitRadio(unit: "stitches" | "inches" | "mm" = "stitches") {
    return this.unitRadioGroup.$(`//button[@role="radio" and @aria-label="${unit}"]`);
  }

  get widthInput() {
    return this.modal.$(`[data-testid="fabric-dimensions-input"]`).$(`[data-testid="width-input"]`);
  }

  get heightInput() {
    return this.modal.$(`[data-testid="fabric-dimensions-input"]`).$(`[data-testid="height-input"]`);
  }

  get colorsListbox() {
    return this.modal.$(`[data-testid="fabric-colors-listbox"]`);
  }

  /** Sets the fabric count (SPI - stitches per inch). */
  async setSpi(count: number) {
    await this.countSelect.click();
    await $(`//div[@role="option" and normalize-space()="${count}"]`).click();
  }

  /** Sets the fabric kind. */
  async setKind(kind: "Aida" | "Evenweave" | "Linen") {
    await this.kindSelect.click();
    await $(`//div[@role="option" and normalize-space()="${kind}"]`).click();
  }

  /** Sets the fabric size dimensions. */
  async setSize(width: number, height: number, unit: "stitches" | "inches" | "mm" = "stitches") {
    await this.getUnitRadio(unit).click();
    await this.widthInput.setValue(width);
    await this.heightInput.setValue(height);
  }

  /** Selects a fabric color from the palette. */
  async selectColor(colorName: string) {
    await this.colorsListbox.$(`//div[@role="option" and normalize-space()="${colorName}"]`).click();
  }
}
