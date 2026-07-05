import { BaseModal } from "./core/base.modal";

/** Page object for the _Settings_ modal. */
export class SettingsModal extends BaseModal {
  constructor() {
    super(`//div[@role="dialog"][.//h2[text()="Settings"]]`);
  }

  /** Opens the Settings modal via the Ctrl+Comma shortcut. */
  async openViaShortcut() {
    await browser.keys(["Control", ","]);
    await this.modal.waitForDisplayed();
  }

  /** Opens the Settings modal via the Manage menu. */
  async openViaManageMenu() {
    await $(`//button[@aria-label="Manage"]`).click();
    await $(`//div[@role="menuitem"][contains(., "Settings")]`).click();
    await this.modal.waitForDisplayed();
  }

  /** Default open method, delegating to the shortcut. */
  async open() {
    await this.openViaShortcut();
  }

  getTab(label: string) {
    return this.modal.$(`//button[@role="tab"][normalize-space()="${label}"]`);
  }

  /** Clicks a settings tab by its label (e.g. "Interface", "Startup"). */
  async switchTab(label: string) {
    await this.getTab(label).click();
  }

  get themeSelect() {
    return this.modal.$(`aria/Theme`);
  }

  /** Opens the theme select and picks the given option. */
  async selectTheme(label: string) {
    await this.themeSelect.click();
    await $(`//div[@role="option"][normalize-space()="${label}"]`).click();
  }

  get scaleSelect() {
    return this.modal.$(`aria/Scale`);
  }

  /** Opens the scale select and picks the given option. */
  async selectScale(label: string) {
    await this.scaleSelect.click();
    await $(`//div[@role="option"][normalize-space()="${label}"]`).click();
  }

  get languageSelect() {
    return this.modal.$(`aria/Language`);
  }

  /** Opens the language select and picks the given option. */
  async selectLanguage(label: string) {
    await this.languageSelect.click();
    await $(`//div[@role="option"][normalize-space()="${label}"]`).click();
  }

  /** Clicks the _Reset to defaults_ button in the modal footer. */
  async clickResetToDefaults() {
    await this.modal.$(`aria/Reset to defaults`).click();
  }
}
