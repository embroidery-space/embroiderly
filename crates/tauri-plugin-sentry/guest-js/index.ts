// import {is }  from '@tauri-apps/api/core'
import { createTransport } from "@sentry/core";
import type { BaseTransportOptions, Breadcrumb, Options } from "@sentry/core";

import { addBreadcrumb, envelope } from "./commands.js";

/** Default options for the Sentry SDK to pass events and breadcrumbs to the Rust SDK. */
export const defaultSentryOptions: Options = {
  // Specify dummy DSN and release to correctly setup Sentry.
  // Requests will be proxied through the Tauri backend and these values will be replaced with real ones.
  dsn: "https://123456@dummy.dsn/0",
  release: "application@0.0.0",
  transport: makeTauriTransport,
  beforeBreadcrumb: sendBreadcrumbToRust,
};

/** Creates a `Transport` that passes envelopes to the Tauri backend. */
function makeTauriTransport(options: BaseTransportOptions) {
  return createTransport(options, async (request) => {
    try {
      await envelope(request);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to send envelope to Tauri:", e);
    }
    return { statusCode: 200 };
  });
}

/** Send a breadcrumb to the Tauri backend. */
function sendBreadcrumbToRust(breadcrumb: Breadcrumb) {
  // Ignore IPC breadcrumbs so we don't get into an infinite loop.
  if (
    typeof breadcrumb.data?.url === "string" &&
    (breadcrumb.data.url.startsWith("ipc://") || breadcrumb.data.url.match(/^https?:\/\/ipc\.localhost/))
  ) {
    return null;
  }

  // eslint-disable-next-line no-console
  addBreadcrumb(breadcrumb).catch((e) => console.error("Failed to add breadcrumb to Tauri:", e));

  return null;
}
