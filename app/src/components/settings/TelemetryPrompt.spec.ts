import { App } from "@embroiderly/ui";

import { describe, expect, test, vi } from "vitest";
import { userEvent, locators } from "vitest/browser";
import type { Locator } from "vitest/browser";
import { defineComponent } from "vue";

import { renderComponent } from "~test-utils/render-component.ts";
import { withBidi } from "~test-utils/with-bidi";

import TelemetryPrompt from "./TelemetryPrompt.vue";

locators.extend({
  getTelemetryPrompt() {
    return this.getByRole("dialog", { name: withBidi`Help Improve ${"Embroiderly"}` });
  },

  getDiagnosticsCheckbox() {
    return this.getByRole("checkbox", { name: "Allow collecting diagnostics reports" });
  },
  getMetricsCheckbox() {
    return this.getByRole("checkbox", { name: "Allow collecting metrics" });
  },

  getRejectButton() {
    return this.getByRole("button", { name: "No, thanks" });
  },
  getAcceptButton() {
    return this.getByRole("button", { name: "Enable" });
  },
});

declare module "vitest/browser" {
  interface LocatorSelectors {
    getTelemetryPrompt(): Locator;

    getDiagnosticsCheckbox(): Locator;
    getMetricsCheckbox(): Locator;

    getRejectButton(): Locator;
    getAcceptButton(): Locator;
  }
}

describe("TelemetryPrompt", () => {
  const TelemetryPromptWrapper = defineComponent({
    components: { App, TelemetryPrompt },
    inheritAttrs: false,
    template: `<App><TelemetryPrompt v-bind="$attrs" /></App>`,
  });

  test("renders the dialog when open", async () => {
    const screen = await renderComponent(TelemetryPromptWrapper, {
      props: { open: true },
    });

    await expect.element(screen.getTelemetryPrompt()).toBeVisible();

    await expect.element(screen.getDiagnosticsCheckbox()).toBeVisible();
    await expect.element(screen.getMetricsCheckbox()).toBeVisible();

    await expect.element(screen.getRejectButton()).toBeVisible();
    await expect.element(screen.getAcceptButton()).toBeVisible();
  });

  test("the accept button is disabled when no checkboxes are checked", async () => {
    const screen = await renderComponent(TelemetryPromptWrapper, {
      props: { open: true },
    });

    await expect.element(screen.getAcceptButton()).toBeDisabled();
  });

  test("the accept button becomes enabled when diagnostics is checked", async () => {
    const screen = await renderComponent(TelemetryPromptWrapper, {
      props: { open: true },
    });

    await userEvent.click(screen.getDiagnosticsCheckbox());

    await expect.element(screen.getAcceptButton()).toBeEnabled();
  });

  test("the accept button becomes enabled when metrics is checked", async () => {
    const screen = await renderComponent(TelemetryPromptWrapper, {
      props: { open: true },
    });

    await userEvent.click(screen.getMetricsCheckbox());

    await expect.element(screen.getAcceptButton()).toBeEnabled();
  });

  test("clicking the reject button emits the close event with no value", async () => {
    const onClose = vi.fn();

    const screen = await renderComponent(TelemetryPromptWrapper, {
      props: { open: true, onClose },
    });

    await userEvent.click(screen.getRejectButton());

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith();
  });

  test("clicking the accept button emits the close event with selected telemetry options", async () => {
    const onClose = vi.fn();

    const screen = await renderComponent(TelemetryPromptWrapper, {
      props: { open: true, onClose },
    });

    await userEvent.click(screen.getDiagnosticsCheckbox());
    await userEvent.click(screen.getAcceptButton());

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith({ diagnostics: true, metrics: false });
  });

  test("clicking the accept button with both checkboxes checked emits the close event with both enabled", async () => {
    const onClose = vi.fn();

    const screen = await renderComponent(TelemetryPromptWrapper, {
      props: { open: true, onClose },
    });

    await userEvent.click(screen.getDiagnosticsCheckbox());
    await userEvent.click(screen.getMetricsCheckbox());
    await userEvent.click(screen.getAcceptButton());

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith({ diagnostics: true, metrics: true });
  });
});
