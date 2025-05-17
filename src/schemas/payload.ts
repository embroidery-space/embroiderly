import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";

import { PaletteItem } from "./pattern.ts";

export class AddedPaletteItemData {
  palitem: PaletteItem;
  palindex: number;

  constructor(data: b.infer<typeof AddedPaletteItemData.schema>) {
    this.palitem = new PaletteItem(data.palitem);
    this.palindex = data.palindex;
  }

  static readonly schema = b.struct({ palitem: PaletteItem.schema, palindex: b.u32() });

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new AddedPaletteItemData(AddedPaletteItemData.schema.deserialize(buffer));
  }
}
