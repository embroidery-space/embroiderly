import { createTestingPinia } from "@pinia/testing";
import type { TestingOptions as CreateTestingPiniaOptions } from "@pinia/testing";
import { vi } from "vitest";
import { page } from "vitest/browser";
import type { Component } from "vue";

import { EditorContextKey } from "~/composables/";
import type { EditorContext } from "~/wasm/";

import { createMockEditorContext } from "./mock-editor-context.ts";

// `ComponentRenderOptions` type does not actually infer component props type.
// `page.render()` has complex generics which we were not successful in replication for out custom utility.
export type ComponentRenderOptions = NonNullable<Parameters<(typeof page)["render"]>[1]> & {
  /** The editor context to provide to the component. */
  editorContext?: boolean | EditorContext;
  /** Options for the Pinia testing store. */
  pinia?: boolean | CreateTestingPiniaOptions;
};

export async function renderComponent(component: Component, options: ComponentRenderOptions = {}) {
  const { pinia, editorContext, global, ...rest } = options;

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

  const provide: Record<string | symbol, unknown> = { ...global?.provide };
  if (editorContext) {
    provide[EditorContextKey as symbol] = typeof editorContext === "object" ? editorContext : createMockEditorContext();
  }

  return await page.render(component, { ...rest, global: { ...global, plugins, provide } });
}
