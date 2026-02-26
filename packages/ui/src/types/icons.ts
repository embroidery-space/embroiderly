import type { Component } from "vue";

export type IconValue = string | Component;

export interface Icons {
  check: IconValue;
  chevronUp: IconValue;
  chevronDown: IconValue;
  chevronRight: IconValue;
  close: IconValue;
  loading: IconValue;
  link: IconValue;
  unlink: IconValue;
  minus: IconValue;
  plus: IconValue;
}
