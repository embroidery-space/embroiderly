import { initDevtools } from "@pixi/devtools";
import { Application } from "pixi.js";
import type { ApplicationOptions, ColorSource } from "pixi.js";

import { Pattern } from "#/core/pattern/";
import { Hint } from "./components/";
import {
  EventType,
  InternalEventType,
  PatternViewport,
  type ViewportOptions,
  type ZoomState,
} from "./pattern-viewport.ts";
import { TextureManager } from "./texture-manager.ts";

import type { Bead, LineStitch, NodeStitch } from "#/core/pattern/";

export interface PatternCanvasOptions {
  render?: Partial<Omit<ApplicationOptions, "width" | "height" | "eventFeatures" | "preference">>;
  viewport?: Pick<ViewportOptions, "wheelAction">;
}

const DEFAULT_INIT_OPTIONS: Partial<ApplicationOptions> = {
  eventFeatures: { globalMove: false },
  antialias: true,
  backgroundAlpha: 0,
  preference: "webgl",
};

// We use a native `EventTarget` instead of an `EventEmitter` from Pixi.js here,
// because this class will be used in a Vue.js environment where it is more convenient to use native events.
export class PatternCanvas extends EventTarget {
  private pixi = new Application();
  private viewport = new PatternViewport();
  private stages = {
    // lowest
    hint: new Hint(),
    // highest
  };

  constructor() {
    super();

    this.viewport.on(EventType.ToolMainAction, (detail) => {
      this.dispatchEvent(new CustomEvent(EventType.ToolMainAction, { detail }));
    });
    this.viewport.on(EventType.ToolAntiAction, (detail) => {
      this.dispatchEvent(new CustomEvent(EventType.ToolAntiAction, { detail }));
    });
    this.viewport.on(EventType.ToolRelease, (detail) => {
      this.dispatchEvent(new CustomEvent(EventType.ToolRelease, { detail }));
    });
    this.viewport.on(EventType.Transform, (detail) => {
      this.dispatchEvent(new CustomEvent(EventType.Transform, { detail }));
    });

    this.viewport.on(InternalEventType.CanvasClear, () => this.clearHint());
  }

  async init(canvas: HTMLCanvasElement, options?: PatternCanvasOptions) {
    const { width, height } = canvas.getBoundingClientRect();

    await this.pixi.init({
      ...DEFAULT_INIT_OPTIONS,
      ...options?.render,
      canvas,
      width,
      height,
    });
    this.viewport.init(this.pixi.renderer.events.domElement, {
      ...options?.viewport,
      screenWidth: width,
      screenHeight: height,
    });

    TextureManager.init(this.pixi.renderer);

    // Replace the default stage with our viewport.
    this.pixi.stage = this.viewport;

    // Init devtools last, so it has access to the fully initialized application.
    if (import.meta.env.DEV) initDevtools({ app: this.pixi });
  }

  destroy() {
    this.viewport.destroy(true);
    this.pixi.destroy(true, true);

    TextureManager.destroy();
  }

  setPattern(pattern: Pattern) {
    this.clear();
    this.viewport.addChild(pattern.root, this.stages.hint);

    const { width, height } = pattern.fabric;
    this.viewport.resizeWorld(width, height);
    this.viewport.fit();
  }

  setZoom(zoom: ZoomState) {
    this.viewport.setZoom(zoom);
  }

  resize(width: number, height: number) {
    this.pixi.renderer.resize(width, height);
    this.viewport.resizeScreen(width, height);
  }

  drawLineHint(line: LineStitch, color: ColorSource) {
    this.stages.hint.drawLineHint(line, color);
  }

  drawNodeHint(node: NodeStitch, color: ColorSource, bead?: Bead) {
    this.stages.hint.drawNodeHint(node, color, bead);
  }

  clear() {
    this.viewport.removeChildren();
  }

  clearHint() {
    this.stages.hint.clearHint();
  }
}
