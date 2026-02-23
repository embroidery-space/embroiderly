import { initDevtools } from "@pixi/devtools";
import { Application } from "pixi.js";
import type { ApplicationOptions } from "pixi.js";

import { Pattern } from "~/modules/pattern-editor/lib/pattern/";

import { PatternView } from "./components/";
import { TextureManager } from "./texture-manager.ts";
import type { TextureManagerOptions } from "./texture-manager.ts";
import { ToolEvent, PatternViewport } from "./viewport.ts";
import type { ToolEventDetail, ViewportOptions, ZoomState } from "./viewport.ts";

/** Options for the pattern application. */
export interface PatternApplicationOptions {
  /** Options for the Pixi.js renderer. */
  render?: Partial<Omit<ApplicationOptions, "width" | "height" | "eventFeatures" | "preference">>;
  /** Options for the custom viewport. */
  viewport?: ViewportOptions;
  /** Options for the texture manager. */
  textureManager?: TextureManagerOptions;
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
  initialized = false;

  #pixi = new Application();
  #viewport = new PatternViewport();

  #textureManager: TextureManager;

  #pattern?: PatternView;

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
    this.#textureManager = new TextureManager(this.#pixi.renderer, options?.textureManager);

    // Replace the default stage with our viewport.
    this.#pixi.stage = this.#viewport;

    // Init devtools last, so it has access to the fully initialized application.
    if (import.meta.env.DEV) initDevtools({ app: this.#pixi });

    this.initialized = true;
  }

  /** Destroys the pattern canvas. */
  destroy() {
    this.#viewport.off(ToolEvent.ToolMainAction, this.handleToolMainAction, this);
    this.#viewport.off(ToolEvent.ToolAntiAction, this.handleToolAntiAction, this);
    this.#viewport.off(ToolEvent.ToolRelease, this.handleToolRelease, this);
    this.#viewport.off(ToolEvent.Transform, this.handleTransform, this);

    this.#textureManager?.destroy();
    this.#pixi.destroy(undefined, true);
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
  get view() {
    return this.#pattern;
  }

  /**
   * Sets the pattern to display in the viewport.
   * @param pattern The pattern to display.
   * @returns The created pattern view.
   */
  setView(pattern: Pattern) {
    if (!this.initialized) throw new Error("The PatternApplicaiton must be initialized first");

    for (const child of this.#viewport.removeChildren()) child.destroy({ children: true });
    this.#pattern = this.#viewport.addChild(new PatternView(pattern, this.#textureManager));

    this.#viewport.resizePattern(this.#pattern.width, this.#pattern.height);
    this.#viewport.fit();

    return this.#pattern;
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
