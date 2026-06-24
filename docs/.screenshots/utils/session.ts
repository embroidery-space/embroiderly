import { setTimeout } from "node:timers/promises";

import { $t } from "./i18n";
import type { Language } from "./i18n";

type Theme = "light" | "dark" | "system";
type Scale = "xx-small" | "x-small" | "small" | "medium" | "large" | "x-large" | "xx-large";

interface UiOptions {
  theme: Theme;
  scale: Scale;
  language: Language;
}

/** Updates the app's UI settings (theme/scale/language) and reloads for them to take effect. */
export async function setAppUi(ui?: Partial<UiOptions>) {
  await browser.execute((ui) => {
    const settings = JSON.parse(localStorage.getItem("embroiderly-settings") || "{}");
    localStorage.setItem("embroiderly-settings", JSON.stringify({ ...settings, ui: { ...settings.ui, ...ui } }));
  }, ui);
  await browser.refresh();
  await setTimeout(1000);

  await browser.execute(() => {
    // @ts-expect-error The `document` object is available inside this callback.
    const style = document.createElement("style");
    style.innerHTML = `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }
    `;
    // @ts-expect-error ...
    document.head.append(style);
  });
}

/** Closes all opened patterns without saving changes, rejecting the "Unsaved Changes" dialog if it appears. */
export async function closeAllPatterns(language: Language) {
  const tabs = () => $$(`//div[@role="tablist"]//button[@role="tab"]`);
  const confirmDialog = $(
    `//div[@role="alertdialog"][.//h2[text()="${$t(language, "unsaved-changes", undefined, "title")}"]]`,
  );

  while ((await tabs().length) > 0) {
    await tabs()[0].$(".//button").click();

    try {
      await confirmDialog.waitForDisplayed({ timeout: 1000 });
      await confirmDialog.$(`button*=${$t(language, "confirm-no")}`).click();
    } catch {
      // No confirmation dialog appeared.
    }
  }

  await $(`[data-testid="welcome-screen"]`).waitForDisplayed();
}

/** Resets the browser session and app state before each screenshot test. */
export async function prepareSession(language: Language) {
  await browser.reloadSession();
  await browser.url("/");

  await browser.setViewport({ width: 1920, height: 1080, devicePixelRatio: 1 });

  await browser.execute(() => {
    localStorage.setItem("embroiderly-tour-offered", "true");
    localStorage.setItem("embroiderly-telemetry-prompt-shown", "true");
  });
  await setAppUi({ theme: "system", scale: "x-large", language });

  await setTimeout(1000);
  await closeAllPatterns(language);
}
