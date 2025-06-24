import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";

import { Pattern } from "./pattern.ts";
import { DisplaySettings } from "./display.ts";
import { PublishSettings } from "./publish.ts";
import { stringify as stringifyUuid } from "uuid";

export class PatternProject {
  id: string;
  pattern: Pattern;
  displaySettings: DisplaySettings;
  publishSettings: PublishSettings;

  constructor(data: b.infer<typeof PatternProject.schema>) {
    this.id = stringifyUuid(new Uint8Array(data.id));
    this.pattern = new Pattern(data.pattern);
    this.displaySettings = new DisplaySettings(data.displaySettings);
    this.publishSettings = new PublishSettings(data.publishSettings);
  }

  static readonly schema = b.struct({
    id: b.array(b.u8(), 16),
    pattern: Pattern.schema,
    displaySettings: DisplaySettings.schema,
    publishSettings: PublishSettings.schema,
  });

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new PatternProject(PatternProject.schema.deserialize(buffer));
  }
}
