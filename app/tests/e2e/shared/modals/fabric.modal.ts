import { BaseModal } from "./core/base.modal";

/** Page object for the _Fabric Properties_ modal. */
export class FabricModal extends BaseModal {
  constructor() {
    super(`//div[@role="dialog"][.//h2[text()="Fabric Properties"]]`);
  }

  /** Opens the Fabric Properties modal by clicking Pattern -> Fabric Properties. */
  async open() {
    await $(`button*=Pattern`).click();
    await $(`//div[@role="menuitem"][contains(., "Fabric Properties")]`).click();
    await this.modal.waitForDisplayed();
  }

  get countSelect() {
    return this.modal.$(`[data-testid="fabric-count-select"]`);
  }

  /** Sets the fabric count (SPI - stitches per inch). */
  async setSpi(count: number) {
    await this.countSelect.click();
    await $(`//div[@role="option" and normalize-space()="${count}"]`).click();
  }

  get kindSelect() {
    return this.modal.$(`[data-testid="fabric-kind-select"]`);
  }

  /** Sets the fabric kind. */
  async setKind(kind: "Aida" | "Evenweave" | "Linen") {
    await this.kindSelect.click();
    await $(`//div[@role="option" and normalize-space()="${kind}"]`).click();
  }

  get unitRadioGroup() {
    return this.modal.$(`[data-testid="fabric-unit-radio-group"]`);
  }

  getUnitRadio(unit: "stitches" | "inches" | "mm" = "stitches") {
    return this.unitRadioGroup.$(`//button[@role="radio" and @aria-label="${unit}"]`);
  }

  get widthInput() {
    return this.modal.$(`[data-testid="fabric-dimensions-input"]`).$$(`input`)[0];
  }

  get heightInput() {
    return this.modal.$(`[data-testid="fabric-dimensions-input"]`).$$(`input`)[1];
  }

  /** Sets the fabric size dimensions. */
  async setSize(width: number, height: number, unit: "stitches" | "inches" | "mm" = "stitches") {
    await this.getUnitRadio(unit).click();
    await this.widthInput.setValue(width);
    await this.heightInput.setValue(height);
  }

  get colorsListbox() {
    return this.modal.$(`[data-testid="fabric-colors-listbox"]`);
  }

  /** Selects a fabric color from the palette. */
  async selectColor(colorName: string) {
    await this.colorsListbox.$(`//div[@role="option" and normalize-space()="${colorName}"]`).click();
  }
}
