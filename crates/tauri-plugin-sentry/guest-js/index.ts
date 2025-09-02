// import {is }  from '@tauri-apps/api/core'
import { createTransport } from "@sentry/core";
import type { BaseTransportOptions, Breadcrumb, Options } from "@sentry/core";

import { addBreadcrumb, envelope } from "./commands.js";

/** Default options for the Sentry SDK to pass events and breadcrumbs to the Rust SDK. */
export const defaultSentryOptions: Options = {
  transport: makeTauriTransport,
  beforeBreadcrumb: sendBreadcrumbToRust,
};

/** Creates a `Transport` that passes envelopes to the Tauri backend. */
function makeTauriTransport(options: BaseTransportOptions) {
  return createTransport(options, async (request) => {
    try {
      await envelope(request);
    } catch (e) {
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

  addBreadcrumb(breadcrumb).catch((e) => console.error("Failed to add breadcrumb to Tauri:", e));

  return null;
}
