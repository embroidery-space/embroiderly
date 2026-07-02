import { Container, Graphics, FederatedPointerEvent } from "pixi.js";
import type { ContainerOptions, DestroyOptions } from "pixi.js";

import { DEFAULT_CONTAINER_OPTIONS } from "../../constants.ts";

export interface SliderOptions extends ContainerOptions {
  /** Graphics for the slider track. */
  track: Graphics;
  /** Graphics for the slider handle. */
  handle: Graphics;

  /**
   * Minimum value.
   * @default 0
   */
  min?: number;
  /**
   * Maximum value.
   * @default 100
   */
  max?: number;
  /**
   * Current value.
   * @default The minimun value.
   */
  value?: number;
  /**
   * Step size for value changes.
   * @default 1
   */
  step?: number;
}

/** Event emitted when slider value changes */
export interface SliderChangeEvent {
  /** Current value. */
  value: number;
  /** Normalized value in range from 0 to 1. */
  normalized: number;
}

/**
 * A slider control that supports Graphics objects only.
 * This is a simplified single slider implementation based on Pixi.js UI.
 */
export class Slider extends Container {
  readonly track: Graphics;
  readonly handle: Graphics;

  #min: number;
  #max: number;
  #value: number;
  #step: number;

  #isDragging = false;

  #onUpdateListeners: Array<(event: SliderChangeEvent) => void> = [];
  #onChangeListeners: Array<(event: SliderChangeEvent) => void> = [];

  constructor(options: SliderOptions) {
    const { min, max, value, step, track, handle, ...containerOptions } = options;

    super({
      ...DEFAULT_CONTAINER_OPTIONS,
      ...containerOptions,
      interactive: true,
      interactiveChildren: true,
      eventMode: "static",
      label: "Slider",
    });

    this.track = this.addChild(track);
    this.track.label = "Slider Track";

    this.handle = this.addChild(handle);
    this.handle.label = "Slider Handle";
    this.handle.y = (this.track.height - this.handle.height) / 2;

    this.#min = min ?? 0;
    this.#max = max ?? 100;
    this.#value = value ?? this.#min;
    this.#step = step ?? 1;

    this.updateSliderPosition();

    this.on("pointerdown", this.onPointerDown, this);
    this.on("pointerup", this.onPointerUp, this);
    this.on("pointerupoutside", this.onPointerUp, this);
    this.on("pointercancel", this.onPointerUp, this);
  }

  override destroy(options?: DestroyOptions) {
    this.#onUpdateListeners.length = 0;
    this.#onChangeListeners.length = 0;

    this.#isDragging = false;
    this.removeAllListeners();

    super.destroy(options);
  }

  /** Current slider value. */
  get value() {
    return this.#value;
  }
  set value(value: number) {
    const clampedValue = Math.max(this.#min, Math.min(this.#max, value));
    const steppedValue = this.snapToStep(clampedValue);
    if (this.#value !== steppedValue) {
      this.#value = steppedValue;
      this.updateSliderPosition();
      this.emitUpdate();
    }
  }

  /** Normalized value in range from 0 to 1. */
  get normalizedValue() {
    return (this.#value - this.#min) / (this.#max - this.#min);
  }
  set normalizedValue(value: number) {
    this.value = value * (this.#max - this.#min) + this.#min;
  }

  /** Minimum value */
  get min() {
    return this.#min;
  }
  set min(value: number) {
    this.#min = value;
    if (this.#value < value) this.value = value;
  }

  /** Maximum value */
  get max() {
    return this.#max;
  }
  set max(value: number) {
    this.#max = value;
    if (this.#value > value) this.value = value;
  }

  /** Step size */
  get step() {
    return this.#step;
  }
  set step(value: number) {
    this.#step = Math.max(0.01, value);
  }

  /** Adds a listener for continuous value updates during dragging. */
  onUpdate(listener: (event: SliderChangeEvent) => void) {
    this.#onUpdateListeners.push(listener);
  }

  /** Removes a listener from the update event. */
  offUpdate(listener: (event: SliderChangeEvent) => void) {
    const index = this.#onUpdateListeners.indexOf(listener);
    if (index !== -1) this.#onUpdateListeners.splice(index, 1);
  }

  /** Adds a listener for value changes when dragging ends. */
  onChange(listener: (event: SliderChangeEvent) => void) {
    this.#onChangeListeners.push(listener);
  }

  /** Removes a listener from the change event. */
  offChange(listener: (event: SliderChangeEvent) => void) {
    const index = this.#onChangeListeners.indexOf(listener);
    if (index !== -1) this.#onChangeListeners.splice(index, 1);
  }

  private onPointerDown(event: FederatedPointerEvent) {
    event.stopPropagation();

    this.#isDragging = true;

    const localPos = this.toLocal(event.global);
    if (localPos.x < this.handle.x || localPos.x > this.handle.x + this.handle.width) {
      // If clicking on the track (not handle), jump to that position.
      const progress = Math.max(0, Math.min(1, localPos.x / this.track.width));
      const newValue = this.#min + progress * (this.#max - this.#min);
      this.value = newValue;
      this.emitChange();
    }

    this.on("globalpointermove", this.onPointerMove, this);
  }

  private onPointerMove(event: FederatedPointerEvent) {
    if (!this.#isDragging) return;
    event.stopPropagation();

    const localPos = this.toLocal(event.global);
    const progress = Math.max(0, Math.min(1, localPos.x / this.track.width));
    const newValue = this.#min + progress * (this.#max - this.#min);

    this.value = newValue;
  }

  private onPointerUp() {
    if (!this.#isDragging) return;

    this.#isDragging = false;
    this.removeAllListeners("globalpointermove");

    this.emitChange();
  }

  private updateSliderPosition() {
    const progress = (this.#value - this.#min) / (this.#max - this.#min);
    this.handle.x = progress * this.track.width;
  }

  /** Snaps the value to the nearest step. */
  private snapToStep(value: number) {
    if (this.#step <= 0) return value;

    const steppedValue = Math.round((value - this.#min) / this.#step) * this.#step + this.#min;
    return Math.max(this.#min, Math.min(this.#max, steppedValue));
  }

  private emitUpdate() {
    const event: SliderChangeEvent = {
      value: this.value,
      normalized: this.normalizedValue,
    };
    for (const listener of this.#onUpdateListeners) listener(event);
  }

  private emitChange() {
    const event: SliderChangeEvent = {
      value: this.value,
      normalized: this.normalizedValue,
    };
    for (const listener of this.#onChangeListeners) listener(event);
  }
}
