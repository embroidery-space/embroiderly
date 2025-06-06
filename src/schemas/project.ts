import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";

import { Pattern } from "./pattern.ts";
import { DisplaySettings } from "./display.ts";
import { stringify as stringifyUuid } from "uuid";

export class PatternProject {
  id: string;
  pattern: Pattern;
  displaySettings: DisplaySettings;

  constructor(data: b.infer<typeof PatternProject.schema>) {
    this.id = stringifyUuid(new Uint8Array(data.id));
    this.pattern = new Pattern(data.pattern);
    this.displaySettings = new DisplaySettings(data.displaySettings);
  }

  static readonly schema = b.struct({
    id: b.array(b.u8(), 16),
    pattern: Pattern.schema,
    displaySettings: DisplaySettings.schema,
  });

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new PatternProject(PatternProject.schema.deserialize(buffer));
  }
}
