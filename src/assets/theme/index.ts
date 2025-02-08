// Common options.
import { primitive } from "./primitive";
import { semantic } from "./semantic";

// Form components.
import { checkbox } from "./checkbox";
import { colorpicker } from "./colorpicker";
import { floatlabel } from "./floatlabel";
import { inputnumber } from "./inputnumber";
import { inputtext } from "./inputtext";
import { listbox } from "./listbox";
import { radiobutton } from "./radiobutton";
import { select } from "./select";
import { toggleswitch } from "./toggleswitch";

// Button components.
import { button } from "./button";

// Panel components.
import { fieldset } from "./fieldset";
import { splitter } from "./splitter";
import { toolbar } from "./toolbar";

// Overlay components.
import { dialog } from "./dialog";
import { tooltip } from "./tooltip";

// Menu components.
import { contextmenu } from "./contextmenu";
import { menu } from "./menu";
import { menubar } from "./menubar";

// Misc components.
import { blockui } from "./blockui";
import { progressspinner } from "./progressspinner";

/**
 * A Nord Theme based on the [Nord Palette] and [Aura Theme] with customizations.
 *
 * [Nord Palette]: https://nordtheme.com/docs/colors-and-palettes
 * [Aura Theme]: https://github.com/primefaces/primevue/tree/master/packages/themes/src/presets/aura
 */
export const NordTheme = {
  primitive,
  semantic,
  directives: { tooltip },
  components: {
    // Form components.
    checkbox,
    colorpicker,
    floatlabel,
    inputnumber,
    inputtext,
    listbox,
    radiobutton,
    select,
    toggleswitch,

    // Button components.
    button,

    // Panel components.
    fieldset,
    splitter,
    toolbar,

    // Overlay components.
    dialog,

    // Menu components.
    contextmenu,
    menu,
    menubar,

    // Misc components.
    blockui,
    progressspinner,
  },
};
