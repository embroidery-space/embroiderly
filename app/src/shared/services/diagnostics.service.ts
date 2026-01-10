/* eslint-disable no-console */

import { invoke } from "@tauri-apps/api/core";

import type { Client, Integration, Options } from "@sentry/core";
import { createTransport, getDefaultIntegrations, init } from "@sentry/vue";

class DiagnosticsServiceClass {
  #sentry: Client;

  constructor() {
    const options: Options = {
      // Specify dummy DSN and release to correctly setup Sentry.
      // Requests will be proxied through the Tauri backend and these values will be replaced with real ones.
      dsn: "https://123456@dummy.dsn/0",
      release: "application@0.0.0",
      transport(options) {
        return createTransport(options, async (request) => {
          try {
            await invoke<void>("plugin:sentry|envelope", request);
          } catch (e) {
            console.error("Failed to send envelope to Tauri:", e);
          }
          return { statusCode: 200 };
        });
      },
      beforeBreadcrumb(breadcrumb) {
        // Ignore IPC breadcrumbs so we don't get into an infinite loop.
        if (!/^(ipc:\/\/|https?:\/\/ipc\.localhost)/.test(breadcrumb.data?.url)) {
          invoke<void>("plugin:sentry|add_breadcrumb", { breadcrumb }).catch((e) => {
            console.error("Failed to add breadcrumb to Tauri:", e);
          });
        }
        return null;
      },
    };

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
