import { invoke } from "@tauri-apps/api/core";
import { PostHog as OriginalPostHog } from "posthog-js/dist/module.no-external";
import type { EventName, Properties, CaptureOptions, BeforeSendFn } from "posthog-js/dist/module.no-external";

type PostHogOptions = Parameters<InstanceType<typeof OriginalPostHog>["init"]>[1];

export interface EventObject {
  name: EventName;
  properties: Properties;
}

class PostHog extends OriginalPostHog {
  constructor() {
    super();
  }

  /**
   * Initializes the PostHog instance with the given options and name.
   * @param options - The PostHog options.
   * @param name - The name of the PostHog instance.
   */
  // @ts-expect-error We intentionally override the `init` method with a different signature.
  init(options: PostHogOptions = {}, name?: string) {
    // This dummy token will be overriden on the Tauri side.
    const token = "dummy_posthog_token";

    const captureEvent: BeforeSendFn = (captureResult) => {
      if (captureResult) {
        const { event, properties } = captureResult;
        invoke<void>("plugin:posthog|capture_event", { event, properties }).catch(console.log);
      }
      return null; // Prevent default behavior.
    };

    // Add a custom `before_send` middleware for capturing and proxying events through the Tauri backend.
    if (!options.before_send) options.before_send = captureEvent;
    else if (typeof options.before_send === "function") options.before_send = [options.before_send, captureEvent];
    else options.before_send.push(captureEvent);

    return this._init(token, options, name) as PostHog;
  }

  // @ts-expect-error We intentionally override the `capture` method with a different signature.
  capture(event: EventObject, options?: CaptureOptions);
  // @ts-expect-error We intentionally override the `capture` method with a different signature.
  capture(event: EventName, properties?: Properties, options?: CaptureOptions);
  capture(event: EventObject | EventName, propertiesOrOptions?: Properties | CaptureOptions, options?: CaptureOptions) {
    let eventName: string;
    let eventProperties: Properties | undefined;
    let captureOptions: CaptureOptions | undefined;

    if (typeof event === "string") {
      eventName = event;
      eventProperties = propertiesOrOptions as Properties;
      captureOptions = options;
    } else {
      eventName = event.name;
      eventProperties = event.properties;
      captureOptions = propertiesOrOptions as CaptureOptions;
    }

    return super.capture(eventName, eventProperties, captureOptions);
  }
}

export const posthog = new PostHog();
