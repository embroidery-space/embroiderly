import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath } from "node:url";

import { $t } from "./i18n";
import type { Language } from "./i18n";

const FRUITS_IMAGE_PATH = path.join(fileURLToPath(new URL("..", import.meta.url)), "assets", "images", "fruits.jpg");

export function actions(language: Language) {
  return {
    async openDemoPattern() {
      await $(`button*=${$t(language, "app-menu-file")}`).click();
      await $(`//div[@role="menuitem"][contains(., "${$t(language, "app-menu-file-open-demo")}")]`).click();
      await $(`//div[@role="menuitem"][contains(., "${$t(language, "demo-pattern-piggies")}")]`).click();
    },

    async openPatternInfo() {
      await $(`button*=${$t(language, "app-menu-pattern")}`).click();
      await $(`//div[@role="menuitem"][contains(., "${$t(language, "pattern-info")}")]`).click();
      await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "pattern-info")}"]]`).waitForDisplayed();
    },

    async openGridProperties() {
      await $(`button*=${$t(language, "app-menu-pattern")}`).click();
      await $(`//div[@role="menuitem"][contains(., "${$t(language, "grid-properties")}")]`).click();
      await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "grid-properties")}"]]`).waitForDisplayed();
    },

    async openFabricProperties() {
      await $(`button*=${$t(language, "app-menu-pattern")}`).click();
      await $(`//div[@role="menuitem"][contains(., "${$t(language, "fabric-properties")}")]`).click();
      await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "fabric-properties")}"]]`).waitForDisplayed();
    },

    async openPdfExport() {
      await $(`button*=${$t(language, "app-menu-file")}`).click();
      await $(`//div[@role="menuitem"][contains(., "${$t(language, "app-menu-file-export")}")]`).click();
      await $(`//div[@role="menuitem"][contains(., "PDF")]`).click();
      await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "pdf-export")}"]]`).waitForDisplayed();
    },

    async openImageImport() {
      await $(`button*=${$t(language, "app-menu-file")}`).click();
      await $(`//div[@role="menuitem"][contains(., "${$t(language, "app-menu-file-import")}")]`).click();
      await $(`//div[@role="menuitem"][contains(., "${$t(language, "app-menu-file-import-image")}")]`).click();
      await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "image-import")}"]]`).waitForDisplayed();

      const fileInput = await $(`input[type="file"]`);

      // Make file input visible.
      await browser.execute((el) => el.classList.remove("hidden"), fileInput);

      // Set file.
      const remoteFile = await browser.uploadFile(FRUITS_IMAGE_PATH);
      await fileInput.setValue(remoteFile);

      // Make file input hidden again.
      await browser.execute((el) => el.classList.add("hidden"), fileInput);

      // Wait for pattern to render.
      await setTimeout(2000);
    },

    async openSettings() {
      await browser.keys(["Control", ","]);
      await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "settings")}"]]`).waitForDisplayed();
    },

    /** Reveals and widens the palette panel so its contents are fully visible in screenshots. */
    async openPalettePanel() {
      await $(`aria/${$t(language, "palette-panel-collapse")}`).click();
      await $(`aria/${$t(language, "palette-panel-expand")}`).click();
      await $$(`div[data-resize-handle=""]`)[0].dragAndDrop({ x: 100, y: 0 });
      await setTimeout(100); // Wait for canvas to adjust its size.
    },

    /** Enters palette editing mode by clicking the "Edit Palette" button and waiting for the palette catalog to appear. */
    async enterPaletteEditingMode() {
      await $(`aria/${$t(language, "palette-edit")}`).click();
      await $(`aria/${$t(language, "palette-catalog")}`)
        .$(`//div[@role="listbox"][.//div[@role="group"]][.//div[@role="option"]]`)
        .waitForDisplayed();
      await setTimeout(100); // Wait for canvas to adjust its size.
    },

    /** Toggles an item (by its translation key) in the palette panel's "⋮" menu. */
    async togglePaletteMenuItem(itemKey: string) {
      await $(`aria/${$t(language, "palette-panel-menu")}`).click();
      await $(`//div[@role="menuitem"][contains(., "${$t(language, itemKey)}")]`).click();
    },

    /** Right-clicks the first option inside the listbox of the panel identified by `rootKey`. */
    async openPaletteContextMenu(rootKey: string) {
      await $(`aria/${$t(language, rootKey)}`)
        .$(`//div[@role="listbox"]`)
        .$(`//div[@role="group"]`)
        .$(`//div[@role="option"]`)
        .click({ button: "right" });
    },

    /** Reveals and widens the canvas panel so its contents are fully visible in screenshots. */
    async openCanvasPanel() {
      await $(`aria/${$t(language, "canvas-panel-collapse")}`).click();
      await $(`aria/${$t(language, "canvas-panel-expand")}`).click();
      await $$(`div[data-resize-handle=""]`)[1].dragAndDrop({ x: -150, y: 0 });
      await setTimeout(100); // Wait for canvas to adjust its size.
    },
  };
}
