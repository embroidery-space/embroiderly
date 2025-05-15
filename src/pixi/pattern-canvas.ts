import { Application, Point } from "pixi.js";
import type { ApplicationOptions, ColorSource } from "pixi.js";
import { PatternView } from "./pattern-view";
import { TextureManager } from "#/pixi";
import type { Bead, LineStitch, NodeStitch } from "#/schemas/pattern";
import { InputManager, Viewport, type ViewportOptions } from "./plugins/viewport";
import { Hint } from "./hint";

export interface PatternCanvasOptions {
  render?: Partial<Omit<ApplicationOptions, "width" | "height" | "eventFeatures" | "preference">>;
  viewport?: Pick<ViewportOptions, "wheelAction">;
}

const DEFAULT_INIT_OPTIONS: Partial<ApplicationOptions> = {
  eventFeatures: { globalMove: false },
  antialias: true,
  backgroundAlpha: 0,
  preference: "webgpu",
};

// We use a native `EventTarget` instead of an `EventEmitter` from Pixi.js here,
// because this class will be used in a Vue.js environment where it is more convenient to use native events.
export class PatternCanvas extends EventTarget {
  private pixi = new Application();
  private stages = {
    // lowest
    viewport: new Viewport(),
    hint: new Hint(), // Actually, it will be put into the viewport to follow its transformations (a local position and scale).
    // highest
  };

  private inputManager: InputManager;

  constructor() {
    super();
    this.inputManager = new InputManager(this, this.stages.viewport);
  }

  async init(canvas: HTMLCanvasElement, { width, height }: CanvasSize, options?: PatternCanvasOptions) {
    await this.pixi.init({
      ...DEFAULT_INIT_OPTIONS,
      ...options?.render,
      canvas,
      width,
      height,
    });
    this.stages.viewport.init({
      events: this.pixi.renderer.events,
      screenWidth: width,
      screenHeight: height,
      ...options?.viewport,
    });
    this.inputManager.init();

    TextureManager.shared.init(this.pixi.renderer);

    this.pixi.stage.addChild(this.stages.viewport);
    this.stages.viewport.addChild(this.stages.hint);
  }

  setPatternView(pattern: PatternView) {
    this.clear();

    pattern.render();
    this.stages.viewport.addChild(...pattern.stages, this.stages.hint);

    const { width, height } = pattern.fabric;
    this.stages.viewport.resizeWorld(width, height);
    this.stages.viewport.fit();
    this.stages.viewport.moveCenter(new Point(width / 2, height / 2));
  }

  clear() {
    this.stages.viewport.removeChildren();
  }

  destroy() {
    this.inputManager.destroy();
    this.pixi.destroy();
  }

  resize({ width, height }: CanvasSize) {
    this.pixi.renderer.resize(width, height);
    this.stages.viewport.resizeScreen(width, height);
  }

  drawLineHint(line: LineStitch, color: ColorSource) {
    this.stages.hint.drawLineHint(line, color);
  }

  drawNodeHint(node: NodeStitch, color: ColorSource, bead?: Bead) {
    this.stages.hint.drawNodeHint(node, color, bead);
  }

  clearHint() {
    this.stages.hint.clearHint();
  }
}

export interface CanvasSize {
  width: number;
  height: number;
}

/** A function that checks if a modifier key is pressed based on the given event. */
export type ModifierChecker = (event: MouseEvent) => boolean;

export interface Modifiers {
  /** Modifier 1. Default is the Ctrl key. */
  mod1: ModifierChecker;

  /** Modifier 2. Default is the Shift key. */
  mod2: ModifierChecker;

  /** Modifier 3. Default is the Alt key. */
  mod3: ModifierChecker;
}

export interface ModifiersState {
  mod1: boolean;
  mod2: boolean;
  mod3: boolean;
}
