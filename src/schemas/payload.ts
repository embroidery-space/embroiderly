import { b } from "@zorsh/zorsh";
import { PaletteItem } from "./pattern";

export class AddedPaletteItemData {
  palitem: PaletteItem;
  palindex: number;

  constructor(data: b.infer<typeof AddedPaletteItemData.schema>) {
    this.palitem = new PaletteItem(data.palitem);
    this.palindex = data.palindex;
  }

  static readonly schema = b.struct({ palitem: PaletteItem.schema, palindex: b.u32() });

  static deserialize(data: Uint8Array) {
    return new AddedPaletteItemData(AddedPaletteItemData.schema.deserialize(data));
  }
}
