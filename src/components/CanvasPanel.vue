<template>
  <div class="size-full">
    <div class="relative">
      <NuxtTabs
        :model-value="appStateStore.currentPattern!.id"
        :items="appStateStore.openedPatterns.map(({ id, title }) => ({ label: title, value: id }))"
        :content="false"
        color="neutral"
        activation-mode="manual"
        :ui="{
          root: 'block border-b border-default',
          list: 'bg-transparent p-0',
          indicator: 'h-full inset-0 rounded-b-none rounded-tl-none shadow-none z-0',
          trigger: [
            'grow-0 min-w-20 hover:data-[state=inactive]:bg-accented hover:cursor-pointer',
            'data-[state=inactive]:border-r border-default rounded-b-none rounded-tl-none',
          ],
        }"
        @update:model-value="switchPattern($event as string)"
      >
        <template #trailing="{ item }">
          <NuxtButton
            size="xs"
            variant="ghost"
            icon="i-lucide:x"
            class="p-0"
            :class="{
              'text-inverted': appStateStore.currentPattern!.id === item.value,
              'text-default': appStateStore.currentPattern!.id !== item.value,
            }"
            @click.stop="patternsStore.closePattern(item.value)"
          />
        </template>
      </NuxtTabs>
      <NuxtProgress v-if="patternsStore.loading" size="sm" :ui="{ root: 'absolute top-full', base: 'rounded-none' }" />
    </div>
    <canvas ref="canvas" class="size-full"></canvas>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, onUnmounted, useTemplateRef, watch } from "vue";
  import { useEventListener } from "@vueuse/core";
  import { Assets, Point } from "pixi.js";
  import { PatternCanvas, EventType, TextureManager, STITCH_FONT_PREFIX, StitchGraphics } from "#/pixi";
  import type { EventDetail } from "#/pixi";
  import {
    FullStitch,
    LineStitch,
    NodeStitch,
    PartStitch,
    FullStitchKind,
    PartStitchKind,
    PartStitchDirection,
    LineStitchKind,
    NodeStitchKind,
  } from "#/schemas/";
  import type { Stitch, StitchKind } from "#/schemas/";

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();
  const settingsStore = useSettingsStore();

  const canvas = useTemplateRef("canvas");
  const patternCanvas = new PatternCanvas();

  async function switchPattern(id: string) {
    if (appStateStore.currentPattern!.id !== id) {
      patternsStore.loadPattern(id);
    }
  }

  watch(
    () => patternsStore.pattern,
    async (view) => {
      if (!view) return;
      await Assets.load(view.allStitchFonts.map((font) => `${STITCH_FONT_PREFIX}${font}`));
      patternCanvas.setPatternView(view);
    },
  );

  let prevStitchState: Stitch | undefined;

  useEventListener<CustomEvent>(patternCanvas, EventType.ToolMainAction, (e) => handleToolMainAction(e.detail), {
    passive: true,
  });
  async function handleToolMainAction(detail: EventDetail) {
    const tool = appStateStore.selectedStitchTool;
    const palindex = appStateStore.selectedPaletteItemIndexes[0];
    if (palindex === undefined) return;

    const { start, end, modifiers } = detail;
    const { x, y } = adjustStitchCoordinate(end, tool);

    switch (tool) {
      case FullStitchKind.Full:
      case FullStitchKind.Petite: {
        const full = new FullStitch({ x, y, palindex, kind: tool });
        prevStitchState ??= full;

        // Whether the stitch should have the same position in the cell as the previous stitch.
        const lockPosition = modifiers.mod1;
        if (lockPosition && prevStitchState instanceof FullStitch) {
          full.x = Math.trunc(x) + (prevStitchState.x - Math.trunc(prevStitchState.x));
          full.y = Math.trunc(y) + (prevStitchState.y - Math.trunc(prevStitchState.y));
        }

        await patternsStore.addStitch(full);
        break;
      }

      case PartStitchKind.Half:
      case PartStitchKind.Quarter: {
        const [fracX, fracY] = [end.x % 1, end.y % 1];
        const direction =
          (fracX < 0.5 && fracY > 0.5) || (fracX > 0.5 && fracY < 0.5)
            ? PartStitchDirection.Forward
            : PartStitchDirection.Backward;
        const part = new PartStitch({ x, y, palindex, kind: tool, direction });
        prevStitchState ??= part;

        // Whether the stitch should have the same position in the cell as the previous stitch.
        const lockPosition = modifiers.mod1;
        if (lockPosition && prevStitchState instanceof PartStitch) {
          part.direction = prevStitchState.direction;
          if (tool === PartStitchKind.Quarter) {
            part.x = Math.trunc(x) + (prevStitchState.x - Math.trunc(prevStitchState.x));
            part.y = Math.trunc(y) + (prevStitchState.y - Math.trunc(prevStitchState.y));
          }
        }

        await patternsStore.addStitch(part);
        break;
      }

      case LineStitchKind.Back: {
        const [_start, _end] = [adjustStitchCoordinate(start, tool), adjustStitchCoordinate(end, tool)];
        if (_start.equals(new Point()) || _end.equals(new Point())) return;
        const line = new LineStitch({ x: [_start.x, _end.x], y: [_start.y, _end.y], palindex, kind: tool });
        if (prevStitchState instanceof LineStitch) {
          line.x[0] = prevStitchState.x[1];
          line.y[0] = prevStitchState.y[1];
        }
        if (line.x[0] === line.x[1] && line.y[0] === line.y[1]) return;
        const lineLength = Math.sqrt(Math.pow(line.x[1] - line.x[0], 2) + Math.pow(line.y[1] - line.y[0], 2));
        // Check that the line is not longer than 1 horizontally and vertically, or it is diagonal.
        if (lineLength > 1 && lineLength !== Math.sqrt(2)) return;
        prevStitchState = line;
        await patternsStore.addStitch(line);
        break;
      }

      case LineStitchKind.Straight: {
        const [_start, _end] = orderPoints(start, end);
        const { x: x1, y: y1 } = adjustStitchCoordinate(_start, tool);
        const { x: x2, y: y2 } = adjustStitchCoordinate(_end, tool);
        const line = new LineStitch({ x: [x1, x2], y: [y1, y2], palindex, kind: tool });
        patternCanvas.drawLineHint(line, patternsStore.pattern!.palette[palindex]!.color);
        break;
      }

      case NodeStitchKind.FrenchKnot:
      case NodeStitchKind.Bead: {
        const node = new NodeStitch({ x, y, palindex, kind: tool, rotated: modifiers.mod1 });
        const palitem = patternsStore.pattern!.palette[palindex]!;
        patternCanvas.drawNodeHint(node, palitem.color);
        break;
      }
    }
  }

  useEventListener<CustomEvent>(patternCanvas, EventType.ToolAntiAction, (e) => handleToolAntiAction(e.detail));
  async function handleToolAntiAction(detail: EventDetail) {
    const { event, end: point } = detail;
    if (event.target instanceof StitchGraphics) {
      await patternsStore.removeStitch(event.target.stitch);
    } else {
      const promises = [FullStitchKind.Full, FullStitchKind.Petite, PartStitchKind.Half, PartStitchKind.Quarter].map(
        (kind) => {
          const { x, y } = adjustStitchCoordinate(point, kind);
          if (kind === FullStitchKind.Full || kind === FullStitchKind.Petite) {
            return patternsStore.removeStitch(new FullStitch({ x, y, kind, palindex: 0 }));
          } else {
            const [fractX, fractY] = [point.x - Math.trunc(x), point.y - Math.trunc(y)];
            const direction =
              (fractX < 0.5 && fractY > 0.5) || (fractX > 0.5 && fractY < 0.5)
                ? PartStitchDirection.Forward
                : PartStitchDirection.Backward;
            return patternsStore.removeStitch(new PartStitch({ x, y, kind, direction, palindex: 0 }));
          }
        },
      );
      await Promise.all(promises);
    }
  }

  useEventListener<CustomEvent>(patternCanvas, EventType.ToolRelease, async (e) => {
    await handleToolReleaseAction(e.detail);
    prevStitchState = undefined;
  });
  async function handleToolReleaseAction(detail: EventDetail) {
    const tool = appStateStore.selectedStitchTool;
    const palindex = appStateStore.selectedPaletteItemIndexes[0];
    if (palindex === undefined) return;

    const { start, end } = detail;
    const { x, y } = adjustStitchCoordinate(end, tool);

    switch (tool) {
      case LineStitchKind.Straight: {
        const [_start, _end] = orderPoints(start, end);
        const { x: x1, y: y1 } = adjustStitchCoordinate(_start, tool);
        const { x: x2, y: y2 } = adjustStitchCoordinate(_end, tool);
        const line = new LineStitch({ x: [x1, x2], y: [y1, y2], palindex, kind: tool });
        await patternsStore.addStitch(line);
        break;
      }

      case NodeStitchKind.FrenchKnot:
      case NodeStitchKind.Bead: {
        const node = new NodeStitch({ x, y, palindex, kind: tool, rotated: false });
        await patternsStore.addStitch(node);
        break;
      }
    }
  }

  useEventListener<CustomEvent>(patternCanvas, EventType.ContextMenu, () => {
    if (import.meta.env.DEV) console.log("Context menu");
  });

  function adjustStitchCoordinate({ x, y }: Point, tool: StitchKind): Point {
    const [intX, intY] = [Math.trunc(x), Math.trunc(y)];
    const [fracX, fracY] = [x - intX, y - intY];
    switch (tool) {
      case FullStitchKind.Full:
      case PartStitchKind.Half: {
        return new Point(intX, intY);
      }
      case FullStitchKind.Petite:
      case PartStitchKind.Quarter: {
        return new Point(fracX > 0.5 ? intX + 0.5 : intX, fracY > 0.5 ? intY + 0.5 : intY);
      }
      case LineStitchKind.Back: {
        if (fracX <= 0.4 && fracY <= 0.4) return new Point(intX, intY); // top-left
        if (fracX >= 0.6 && fracY <= 0.4) return new Point(intX + 1, intY); // top-right
        if (fracX <= 0.4 && fracY >= 0.6) return new Point(intX, intY + 1); // bottom-left
        if (fracX >= 0.6 && fracY >= 0.6) return new Point(intX + 1, intY + 1); // bottom-right
        return new Point(); // to not handle it
      }
      case LineStitchKind.Straight:
      case NodeStitchKind.FrenchKnot:
      case NodeStitchKind.Bead: {
        return new Point(
          fracX > 0.5 ? intX + 1 : fracX > 0.25 ? intX + 0.5 : intX,
          fracY > 0.5 ? intY + 1 : fracY > 0.25 ? intY + 0.5 : intY,
        );
      }
    }
  }

  /** Orders points so that is no way to draw two lines with the same coordinates. */
  function orderPoints(start: Point, end: Point): [Point, Point] {
    if (start.y < end.y || (start.y === end.y && start.x < end.x)) return [start, end];
    else return [end, start];
  }

  onMounted(async () => {
    const canvasElement = canvas.value!;
    await patternCanvas.init(canvasElement, canvasElement.getBoundingClientRect(), {
      render: {
        antialias: settingsStore.viewport.antialias,
        resizeTo: canvasElement,
      },
      viewport: {
        wheelAction: settingsStore.viewport.wheelAction,
      },
    });

    const patternView = patternsStore.pattern;
    if (!patternView) return;
    await Assets.load(patternView.allStitchFonts.map((font) => `${STITCH_FONT_PREFIX}${font}`));
    patternCanvas.setPatternView(patternView);
  });

  onUnmounted(async () => {
    patternCanvas.clear();
    TextureManager.shared.clear();
  });
</script>
