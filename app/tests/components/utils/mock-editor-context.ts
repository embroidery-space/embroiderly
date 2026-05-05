import { vi } from "vitest";
import type { Mock } from "vitest";

import type { EditorContext } from "~/wasm/";
import { EditorEventBus } from "~/wasm/event-bus.ts";

export type MockEditorContext = Omit<EditorContext, "editor" | "files"> & {
  editor: { [K in keyof EditorContext["editor"]]: Mock };
  files: { [K in keyof EditorContext["files"]]: Mock };
};

export function createMockEditorContext(): MockEditorContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function createSpyProxy(): any {
    const stubs = new Map<PropertyKey, Mock>();
    return new Proxy(
      {},
      {
        get(_target, prop) {
          if (!stubs.has(prop)) stubs.set(prop, vi.fn().mockResolvedValue(undefined));
          return stubs.get(prop);
        },
      },
    );
  }

  return {
    editor: createSpyProxy(),
    events: new EditorEventBus(),
    files: createSpyProxy(),
  };
}
