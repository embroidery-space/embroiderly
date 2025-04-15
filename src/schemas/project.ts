import { b } from "@zorsh/zorsh";
import { Pattern } from "./pattern.ts";
import { DisplaySettings } from "./display.ts";

export type PatternKey = string;
export class PatternProject {
  key: PatternKey;
  pattern: Pattern;
  displaySettings: DisplaySettings;

  constructor(data: b.infer<typeof PatternProject.schema>) {
    this.key = data.key;
    this.pattern = new Pattern(data.pattern);
    this.displaySettings = new DisplaySettings(data.displaySettings);
  }

  static readonly schema = b.struct({
    key: b.string(),
    pattern: Pattern.schema,
    displaySettings: DisplaySettings.schema,
  });

  static deserialize(buffer: Uint8Array) {
    return new PatternProject(PatternProject.schema.deserialize(buffer));
  }
}
