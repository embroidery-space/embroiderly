export interface Locale {
  name: string;
  code: string;
  dir: Direction;
  messages: Messages;
}

export type Direction = "ltr" | "rtl";

export type Messages = {
  inputNumber: {
    increment: string;
    decrement: string;
  };
  select: {
    search: string;
    noData: string;
    noMatches: string;
  };
};
