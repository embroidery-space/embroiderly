import { createTestingPinia } from "@pinia/testing";
import type { TestingOptions as CreateTestingPiniaOptions } from "@pinia/testing";
import { vi } from "vitest";
import { page } from "vitest/browser";
import type { Component } from "vue";

type RenderOptions = NonNullable<Parameters<(typeof page)["render"]>[1]> & {
  pinia?: boolean | CreateTestingPiniaOptions;
};

// `RenderOptions` are not actually infer component props type.
// `page.render()` has complex generics which we were not successful in replication for out custom utility.
export async function renderComponent(component: Component, options: RenderOptions = {}) {
  const { pinia, global, ...rest } = options;
  const plugins = global?.plugins ?? [];

  if (pinia) {
    const piniaOptions = typeof pinia === "object" ? pinia : {};
    plugins.unshift(
      createTestingPinia({
        stubActions: true,
        createSpy: vi.fn,
        ...piniaOptions,
      }),
    );
  }

  return await page.render(component, { ...rest, global: { ...global, plugins } });
}
