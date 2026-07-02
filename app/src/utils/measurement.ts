import { round } from "es-toolkit";

export function inches2mm(inches: number) {
  return round(inches * 25.4);
}

export function mm2inches(mm: number) {
  return round(mm / 25.4, 2);
}

export function mm2px(mm: number) {
  return mm * 3.779_527_559_1;
}

export function size2stitches(size: number, count: number) {
  return round(size * count);
}

export function stitches2inches(stitches: number, count: number) {
  return round(stitches / count, 2);
}

export function stitches2mm(stitches: number, count: number) {
  return inches2mm(stitches2inches(stitches, count));
}
