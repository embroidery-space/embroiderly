export interface Locale {
  name: string;
  code: string;
  dir: Direction;
  messages: Messages;
}

export type Direction = "ltr" | "rtl";

export type Messages = {
  confirmDialog: {
    cancel: string;
    no: string;
    yes: string;
  };
  dialog: {
    close: string;
  };
  filePicker: {
    chooseFile: string;
  };
  inputNumber: {
    increment: string;
    decrement: string;
  };
  listbox: {
    search: string;
    empty: string;
  };
  select: {
    search: string;
    noData: string;
    noMatches: string;
  };
  slider: {
    thumb: string;
  };
  toast: {
    close: string;
    focus: string;
    notification: string;
  };
};
