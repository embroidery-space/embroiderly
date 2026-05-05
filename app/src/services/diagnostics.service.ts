import type { Client, Integration, Options } from "@sentry/core";
import { getDefaultIntegrations, init } from "@sentry/vue";

class DiagnosticsServiceClass {
  #client: Client;

  // Always start opted-out.
  // The client is enabled in `App.vue` based on the user preferences.
  enabled = false;

  constructor() {
    const options: Options = {
      debug: import.meta.env.DEV,
      dsn: import.meta.env.VITE_EMBROIDERLY_SENTRY_DSN,
      release: `embroiderly@${__APP_VERSION__}`,
    };

    // Initialize a standard browser client.
    // The Vue integration is added in the `main.ts` when the application is initialized.
    this.#client = init({
      ...options,
      defaultIntegrations: getDefaultIntegrations(options),
      beforeSend: (event) => (this.enabled ? event : null),
      beforeSendTransaction: (event) => (this.enabled ? event : null),
    })!;
  }

  addIntegration(integration: Integration) {
    this.#client.addIntegration(integration);
  }

  captureException(exception: unknown) {
    this.#client.captureException(exception);
  }
}
export const DiagnosticsService = new DiagnosticsServiceClass();
