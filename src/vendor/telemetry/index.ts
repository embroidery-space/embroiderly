import { posthog as _posthog } from "@embroiderly/tauri-plugin-posthog";

export const posthog = _posthog.init({
  advanced_enable_surveys: false,
  advanced_disable_flags: true,
  advanced_disable_feature_flags: true,
  advanced_disable_toolbar_metrics: true,
  advanced_disable_feature_flags_on_first_load: true,
  advanced_only_evaluate_survey_feature_flags: true,
});

export * as sentry from "@sentry/vue";

export * as Event from "./events.ts";
