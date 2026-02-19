export interface Locale {
  name: string;
  code: string;
  dir: Direction;
  messages: Messages;
}

export type Direction = "ltr" | "rtl";

export type Messages = {
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
  select: {
    search: string;
    noData: string;
    noMatches: string;
  };
  slider: {
    thumb: string;
  };
};
