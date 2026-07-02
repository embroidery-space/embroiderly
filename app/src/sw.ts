/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();

// oxlint-disable-next-line no-underscore-dangle
precacheAndRoute(self.__WB_MANIFEST);

// The `SKIP_WAITING` listener gives us the "ask before updating" UX.
// Without it, the new SW would activate on every reload by default.
self.addEventListener("message", (event) => {
  // The origin check is not really needed in for service workers, as they are already origin-scoped, which is enforced directly by the browsers.
  // However, this check satisfies CodeQL static analysis, so that no warning alerts are reported.
  if (event.origin !== self.location.origin) return;

  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
