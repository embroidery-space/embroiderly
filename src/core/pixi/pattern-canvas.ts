import { initDevtools } from "@pixi/devtools";
import { Application } from "pixi.js";
import type { ApplicationOptions, ColorSource } from "pixi.js";

import { Pattern } from "#/core/pattern/";
import { Hint } from "./components/";
import { EventType, PatternViewport, type ViewportOptions, type ZoomState } from "./pattern-viewport.ts";
import { TextureManager } from "./texture-manager.ts";

import type { Bead, LineStitch, NodeStitch } from "#/core/pattern/";

/** Options for the pattern canvas. */
export interface PatternCanvasOptions {
  /** Options for the Pixi.js renderer. */
  render?: Partial<Omit<ApplicationOptions, "width" | "height" | "eventFeatures" | "preference">>;
  /** Options for the custom viewport. */
  viewport?: ViewportOptions;
}

const DEFAULT_INIT_OPTIONS: Partial<ApplicationOptions> = {
  eventFeatures: {
    // We don't need to support global mouse movement.
    globalMove: false,
    // We handle wheel events ourselves so we disable Pixi.js wheel events for performance.
    wheel: false,
  },
  antialias: true,
  backgroundAlpha: 0,
  preference: "webgl",
};

// We use a native `EventTarget` instead of an `EventEmitter` from Pixi.js here,
// because this class will be used in a Vue.js environment where it is more convenient to use native events.
export class PatternCanvas extends EventTarget {
  #pixi = new Application();
  #viewport = new PatternViewport();

  #stages = {
    // lowest
    hint: new Hint(),
    // highest
  };

  constructor() {
    super();

    this.#viewport.on(EventType.ToolMainAction, (detail) => {
      this.dispatchEvent(new CustomEvent(EventType.ToolMainAction, { detail }));
    });
    this.#viewport.on(EventType.ToolAntiAction, (detail) => {
      this.dispatchEvent(new CustomEvent(EventType.ToolAntiAction, { detail }));
    });
    this.#viewport.on(EventType.ToolRelease, (detail) => {
      this.dispatchEvent(new CustomEvent(EventType.ToolRelease, { detail }));
    });
    this.#viewport.on(EventType.Transform, (detail) => {
      this.dispatchEvent(new CustomEvent(EventType.Transform, { detail }));
    });
  }

  /**
   * Initializes the pattern canvas.
   * @param canvas The canvas element to use for rendering.
   * @param options The options to use for initializing the canvas.
   */
  async init(canvas: HTMLCanvasElement, options?: PatternCanvasOptions) {
    const { width, height } = canvas.getBoundingClientRect();

    // Initialize the Pixi application and custom viewport.
    await this.#pixi.init({
      ...DEFAULT_INIT_OPTIONS,
      ...options?.render,
      canvas,
      width,
      height,
    });
    this.#viewport.init(this.#pixi.renderer.events.domElement, options?.viewport);

    // Initialize the texture manager.
    TextureManager.init(this.#pixi.renderer);

    // Replace the default stage with our viewport.
    this.#pixi.stage = this.#viewport;

    // Init devtools last, so it has access to the fully initialized application.
    if (import.meta.env.DEV) initDevtools({ app: this.#pixi });
  }

  /** Destroys the pattern canvas. */
  destroy() {
    this.#pixi.destroy(undefined, true);
    TextureManager.destroy();
  }

  /**
   * Sets the pattern to display in the viewport.
   * @param pattern The pattern to display.
   */
  setPattern(pattern: Pattern) {
    this.#viewport.removeChildren();
    this.#viewport.addChild(pattern.root, this.#stages.hint);

    const { width, height } = pattern.fabric;
    this.#viewport.resizePattern(width, height);
    this.#viewport.fit();
  }

  /**
   * Sets the zoom level of the viewport.
   * @param zoom The zoom level to set.
   */
  setZoom(zoom: ZoomState) {
    this.#viewport.setZoom(zoom);
  }

  /**
   * Resizes the Pixi.js renderer.
   * @param width The new width of the renderer.
   * @param height The new height of the renderer.
   */
  resize(width: number, height: number) {
    this.#pixi.renderer.resize(width, height);
    this.#viewport.resizeScreen(width, height);
  }

  /**
   * Draws a line hint on the canvas.
   * @param line The line to draw.
   * @param color The color of the line.
   */
  drawLineHint(line: LineStitch, color: ColorSource) {
    this.#stages.hint.drawLineHint(line, color);
  }

  /**
   * Draws a node hint on the canvas.
   * @param node The node to draw.
   * @param color The color of the node.
   * @param bead The bead to draw (optional).
   */
  drawNodeHint(node: NodeStitch, color: ColorSource, bead?: Bead) {
    this.#stages.hint.drawNodeHint(node, color, bead);
  }

  /** Clears the temporary display object (e.g. hints). */
  clear() {
    this.#stages.hint.clearHint();
  }
}
