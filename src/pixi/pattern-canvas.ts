import { Application, Point } from "pixi.js";
import type { ApplicationOptions, ColorSource } from "pixi.js";
import { PatternView } from "./pattern-view";
import { TextureManager } from "#/pixi";
import type { Bead, LineStitch, NodeStitch } from "#/schemas/pattern";
import { InputManager } from "./plugins/input-manager";
import { Viewport } from "./plugins/viewport";
import { Hint } from "./hint";

const DEFAULT_INIT_OPTIONS: Partial<ApplicationOptions> = {
  eventFeatures: { globalMove: false },
  antialias: true,
  backgroundAlpha: 0,
};

const DEFAULT_MODIFIERS: Modifiers = { mod1: (e) => e.ctrlKey, mod2: (e) => e.shiftKey, mod3: (e) => e.altKey };

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
  private modifiers = DEFAULT_MODIFIERS;

  constructor() {
    super();
    this.inputManager = new InputManager(this, this.stages.viewport, { modifiers: this.modifiers });
  }

  async init({ width, height }: CanvasSize, options?: Partial<Omit<ApplicationOptions, "width" | "height">>) {
    await this.pixi.init(Object.assign({ width, height }, DEFAULT_INIT_OPTIONS, options));
    this.stages.viewport.init({
      events: this.pixi.renderer.events,
      screenWidth: width,
      screenHeight: height,
      modifiers: this.modifiers,
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
