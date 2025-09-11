import { initDevtools } from "@pixi/devtools";
import { Application, type ApplicationOptions } from "pixi.js";

import { type PatternView } from "./components/";
import { TextureManager } from "./texture-manager.ts";
import { ToolEvent, PatternViewport, type ToolEventDetail, type ViewportOptions, type ZoomState } from "./viewport.ts";

/** Options for the pattern application. */
export interface PatternApplicationOptions {
  /** Options for the Pixi.js renderer. */
  render?: Partial<Omit<ApplicationOptions, "width" | "height" | "eventFeatures" | "preference">>;
  /** Options for the custom viewport. */
  viewport?: ViewportOptions;
}

const DEFAULT_INIT_OPTIONS: Partial<ApplicationOptions> = {
  eventFeatures: {
    // We handle wheel events ourselves so we disable Pixi.js wheel events for performance.
    wheel: false,
  },
  antialias: true,
  backgroundAlpha: 0,
  preference: "webgl",
};

export class PatternApplication extends EventTarget {
  #pixi = new Application();
  #viewport = new PatternViewport();

  #pattern: PatternView | undefined;

  constructor() {
    super();

    this.#viewport.on(ToolEvent.ToolMainAction, this.handleToolMainAction, this);
    this.#viewport.on(ToolEvent.ToolAntiAction, this.handleToolAntiAction, this);
    this.#viewport.on(ToolEvent.ToolRelease, this.handleToolRelease, this);
    this.#viewport.on(ToolEvent.Transform, this.handleTransform, this);
  }

  /**
   * Initializes the pattern application.
   * @param canvas The canvas element to use for rendering.
   * @param options The options to use for initializing the application.
   */
  async init(canvas: HTMLCanvasElement, options?: PatternApplicationOptions) {
    const { width, height } = canvas.getBoundingClientRect();

    // Initialize the Pixi.js `Application` and custom viewport.
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
    this.#viewport.off(ToolEvent.ToolMainAction, this.handleToolMainAction, this);
    this.#viewport.off(ToolEvent.ToolAntiAction, this.handleToolAntiAction, this);
    this.#viewport.off(ToolEvent.ToolRelease, this.handleToolRelease, this);
    this.#viewport.off(ToolEvent.Transform, this.handleTransform, this);

    this.#pixi.destroy(undefined, {
      children: true,
      context: true,
      style: true,
      texture: false,
      textureSource: false,
    });

    TextureManager.destroy();
  }

  private handleToolMainAction(detail: ToolEventDetail) {
    this.dispatchEvent(new CustomEvent(ToolEvent.ToolMainAction, { detail }));
  }
  private handleToolAntiAction(detail: ToolEventDetail) {
    this.dispatchEvent(new CustomEvent(ToolEvent.ToolAntiAction, { detail }));
  }
  private handleToolRelease(detail: ToolEventDetail) {
    this.dispatchEvent(new CustomEvent(ToolEvent.ToolRelease, { detail }));
  }
  private handleTransform(detail: ToolEventDetail) {
    this.dispatchEvent(new CustomEvent(ToolEvent.Transform, { detail }));
  }

  /** The current pattern view. */
  get view(): PatternView | undefined {
    return this.#pattern;
  }

  /**
   * Sets the pattern view to display in the viewport.
   * @param pattern The pattern to display.
   */
  set view(pattern: PatternView) {
    this.#pattern = pattern;

    this.#viewport.removeChildren();
    this.#viewport.addChild(pattern);

    this.#viewport.resizePattern(pattern.width, pattern.height);
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
}
