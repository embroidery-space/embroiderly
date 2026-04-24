import init, { EditorWrapper, FileManager } from "@embroiderly/wasm";

import { createDispatcher } from "./dispatcher.ts";
import { EditorEventBus } from "./event-bus.ts";

export type { EditorEventBus, EditorEvents } from "./event-bus.ts";

export interface EditorContext {
  editor: EditorWrapper;
  events: EditorEventBus;
  files: FileManager;
}

/**
 * Initializes the Wasm module and wires its callback to the event bus.
 * Must be called once at the app startup.
 */
export async function initEditor(): Promise<EditorContext> {
  await init();

  const events = new EditorEventBus();
  const editor = await EditorWrapper.create(createDispatcher(events));
  const files = await FileManager.create();

  return { editor, events, files };
}
