import type { EventObject } from "@embroiderly/tauri-plugin-posthog";
import type { Properties } from "posthog-js/dist/module.no-external";

import type { OtherOptions, TelemetryOptions, UiOptions, UpdaterOptions, ViewportOptions } from "~/stores/settings";

export class AppSettingsChanged implements EventObject {
  name = "app_settings_changed";
  properties: Properties;

  constructor(settings: {
    ui: UiOptions;
    viewport: ViewportOptions;
    updater: UpdaterOptions;
    telemetry: TelemetryOptions;
    other: OtherOptions;
  }) {
    const { ui, viewport, updater, telemetry, other } = settings;
    this.properties = {
      ui_theme: ui.theme,
      ui_scale: ui.scale,
      ui_language: ui.language,

      viewport_antialias: viewport.antialias,
      viewport_wheel_action: viewport.wheelAction,

      updater_auto_check: updater.autoCheck,

      telemetry_diagnostics_enabled: telemetry.diagnostics,
      telemetry_metrics_enabled: telemetry.metrics,

      use_palette_item_color_for_stitch_tools: other.usePaletteItemColorForStitchTools,
      auto_save_interval: other.autoSaveInterval,
    };
  }
}

export class ToolChanged implements EventObject {
  name = "tool_changed";
  properties: Properties;

  constructor(currentTool: string, previousTool: string) {
    this.properties = {
      current_tool: currentTool,
      previous_tool: previousTool,
    };
  }
}
