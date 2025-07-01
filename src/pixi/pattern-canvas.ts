import { initDevtools } from "@pixi/devtools";
import { Application, Point } from "pixi.js";
import type { ApplicationOptions, ColorSource } from "pixi.js";
import { PatternView } from "./pattern-view";
import { TextureManager } from "#/pixi";
import type { Bead, LineStitch, NodeStitch } from "#/schemas/pattern";
import { EventType, InternalEventType, PatternViewport, type ViewportOptions } from "./pattern-viewport.ts";
import { Hint } from "./hint.ts";

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

    initDevtools(this.pixi);

    this.viewport.on(EventType.ToolMainAction, (detail) => {
      this.dispatchEvent(new CustomEvent(EventType.ToolMainAction, { detail }));
    });
    this.viewport.on(EventType.ToolAntiAction, (detail) => {
      this.dispatchEvent(new CustomEvent(EventType.ToolAntiAction, { detail }));
    });
    this.viewport.on(EventType.ToolRelease, (detail) => {
      this.dispatchEvent(new CustomEvent(EventType.ToolRelease, { detail }));
    });
    this.viewport.on(EventType.ContextMenu, (detail) => {
      this.dispatchEvent(new CustomEvent(EventType.ContextMenu, { detail }));
    });

    this.viewport.on(InternalEventType.CanvasClear, () => this.clearHint());
  }

  async init(canvas: HTMLCanvasElement, { width, height }: CanvasSize, options?: PatternCanvasOptions) {
    await this.pixi.init({
      ...DEFAULT_INIT_OPTIONS,
      ...options?.render,
      canvas,
      width,
      height,
    });
    this.viewport.init(this.pixi.renderer.events.domElement, {
      screenWidth: width,
      screenHeight: height,
      ...options?.viewport,
    });

    TextureManager.shared.init(this.pixi.renderer);

    this.pixi.stage.addChild(this.viewport);
    this.viewport.addChild(this.stages.hint);
  }

  destroy() {
    this.pixi.destroy();
  }

  setPatternView(pattern: PatternView) {
    this.clear();

    pattern.render?.();
    this.viewport.addChild(pattern.root, this.stages.hint);

    const { width, height } = pattern.fabric;
    this.viewport.resizeWorld(width, height);
    this.viewport.fit();
    this.viewport.moveCenter(new Point(width / 2, height / 2));
  }

  resize({ width, height }: CanvasSize) {
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

export interface CanvasSize {
  width: number;
  height: number;
}
