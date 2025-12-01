import { defaultSentryOptions } from "@embroiderly/tauri-plugin-sentry";

import { getDefaultIntegrations, init } from "@sentry/browser";
import type { Client, Integration, Options } from "@sentry/core";

class DiagnosticsServiceClass {
  #sentry: Client;

  constructor() {
    const options = { ...defaultSentryOptions } as Options;

    // Initialize a standard browser client.
    // The Vue integration is added when the application is initialized.
    this.#sentry = init({
      ...options,
      defaultIntegrations: getDefaultIntegrations(options),
    })!;
  }

  addIntegration(integration: Integration) {
    this.#sentry.addIntegration(integration);
  }

  captureException(exception: unknown) {
    this.#sentry.captureException(exception);
  }
}

export const DiagnosticsService = new DiagnosticsServiceClass();
