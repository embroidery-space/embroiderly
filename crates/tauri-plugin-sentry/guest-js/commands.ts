import { invoke } from "@tauri-apps/api/core";
import type { Breadcrumb, TransportRequest } from "@sentry/core";

export async function envelope(request: TransportRequest) {
  return await invoke<void>("plugin:sentry|envelope", request);
}

export async function addBreadcrumb(breadcrumb: Breadcrumb) {
  return await invoke<void>("plugin:sentry|add_breadcrumb", { breadcrumb });
}
