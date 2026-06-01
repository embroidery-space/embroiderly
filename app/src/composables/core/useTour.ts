import { createSharedComposable, until, useLocalStorage } from "@vueuse/core";
import { driver as initDriver } from "driver.js";
import { ref, watch } from "vue";

import { useI18n } from "~/composables/";
import { PaletteMode, useEditorStateStore, usePatternStore } from "~/stores/";

type TourStep = "offer-tour" | "edit-palette" | "add-color" | "save-palette" | "tour-done";

/** Provides a one-time guided tour that coaches new users on how to start working in Embroiderly. */
export const useTour = createSharedComposable(() => {
  const { fluent } = useI18n();

  const editorStateStore = useEditorStateStore();
  const patternStore = usePatternStore();

  const currentStep = ref<TourStep | null>(null);
  const tourOffered = useLocalStorage("embroiderly-tour-offered", false);

  const driver = initDriver({
    allowClose: true,
    disableActiveInteraction: false,
    onDestroyed: () => {
      currentStep.value = null;
    },
  });

  watch(
    () => editorStateStore.paletteMode,
    (newMode, oldMode) => {
      if (newMode === PaletteMode.Editing && oldMode === PaletteMode.Regular && currentStep.value === "edit-palette") {
        void goToCatalogStep();
      } else if (newMode === PaletteMode.Regular && currentStep.value === "save-palette") {
        finish();
      }
    },
  );

  watch(
    () => patternStore.pattern.palette.length,
    (newLen, oldLen) => {
      if (currentStep.value !== "add-color") return;
      if (newLen > oldLen) goToSaveStep();
    },
  );

  /**
   * Offers the tour to the user via a centered driver.js popover.
   * Waits for the auto-created pattern to be ready before showing the prompt.
   */
  async function offer() {
    // The startup action (creating the new pattern) is async, so wait for it to finish.
    await until(() => !patternStore.pattern.isNil).toBe(true, { timeout: 5000 });

    // If the pattern never loaded (e.g. `StartupAction.Nothing`), skip the tour silently.
    if (patternStore.pattern.isNil) return;

    tourOffered.value = true;
    currentStep.value = "offer-tour";

    driver.highlight({
      popover: {
        ...fluent.$ta("tour-welcome"),

        showButtons: ["close", "previous", "next"],
        prevBtnText: fluent.$t("tour-welcome-skip"),
        nextBtnText: fluent.$t("tour-welcome-start"),

        onCloseClick: cancel,
        onPrevClick: cancel,
        onNextClick: goToEditStep,
      },
    });
  }

  /** Step 1: highlight the Edit Palette button and wait for the user to click it. */
  function goToEditStep() {
    currentStep.value = "edit-palette";
    driver.highlight({
      element: '[data-tour="palette-edit"]',
      popover: {
        ...fluent.$ta("tour-edit-palette"),
        showButtons: ["close"],
      },
    });
  }

  /**
   * Step 2: the palette just entered editing mode and the catalog has opened.
   * Wait for the catalog items to render, then highlight the first color in the catalog.
   */
  async function goToCatalogStep() {
    currentStep.value = "add-color";

    const element = await waitForElement('[data-tour="add-color"] [role="listbox"]');

    // Guard: the user may have cancelled while we were waiting for items to load.
    if (currentStep.value !== "add-color") return;

    // Catalog items never appeared (empty or load failed). Skip gracefully.
    if (!element) {
      goToSaveStep();
      return;
    }

    driver.highlight({
      element,
      popover: {
        ...fluent.$ta("tour-add-color"),
        showButtons: ["close"],
      },
    });
  }

  /** Step 3: a color was added — highlight the Save Palette button. */
  function goToSaveStep() {
    currentStep.value = "save-palette";
    driver.highlight({
      element: '[data-tour="palette-save"]',
      popover: {
        ...fluent.$ta("tour-save-palette"),
        showButtons: ["close"],
      },
    });
  }

  /** Final step: show a centered "all set" popover, then clean up. */
  function finish() {
    currentStep.value = "tour-done";
    driver.highlight({
      popover: {
        ...fluent.$ta("tour-done"),
        showButtons: ["next"],
        nextBtnText: fluent.$t("tour-done-button"),
        onNextClick: () => {
          currentStep.value = null;
          driver.destroy();
        },
      },
    });
  }

  /** Immediately cancels the tour and destroys the driver instance. */
  function cancel() {
    currentStep.value = null;
    driver.destroy();
  }

  return { offer, cancel, tourOffered };
});

/** Waits for an element matching `selector` to appear in the DOM. */
function waitForElement(selector: string, timeout = 8000): Promise<Element | null> {
  const existing = document.querySelector(selector);
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        clearTimeout(timer);

        // oxlint-disable-next-line promise/no-multiple-resolved
        resolve(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}
