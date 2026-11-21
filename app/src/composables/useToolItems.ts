import type { ToolSelectItem } from "@embroiderly/ui";

import { computed } from "vue";

import { tools } from "~/lib/tools/";

import { useI18n } from "./useI18n.ts";

/** Shared tool items definition. */
export function useToolItems() {
  const { fluent } = useI18n();

  const fullstitches = computed<ToolSelectItem[]>(() => [
    {
      value: tools.FullStitch,
      label: fluent.$t("stitch-full"),
      icon: "stitch-full",
      shortcut: "F",
    },
  ]);

  const petitestitches = computed<ToolSelectItem[]>(() => [
    {
      value: tools.PetiteStitch,
      label: fluent.$t("stitch-petite"),
      icon: "stitch-petite",
      shortcut: "P",
    },
    {
      value: tools.PetiteStitchTL,
      label: fluent.$t("stitch-petite-tl"),
      icon: "stitch-petite-tl",
      shortcut: "P-T-L",
    },
    {
      value: tools.PetiteStitchTR,
      label: fluent.$t("stitch-petite-tr"),
      icon: "stitch-petite-tr",
      shortcut: "P-T-R",
    },
    {
      value: tools.PetiteStitchBR,
      label: fluent.$t("stitch-petite-br"),
      icon: "stitch-petite-br",
      shortcut: "P-B-R",
    },
    {
      value: tools.PetiteStitchBL,
      label: fluent.$t("stitch-petite-bl"),
      icon: "stitch-petite-bl",
      shortcut: "P-B-L",
    },
  ]);

  const halfstitches = computed<ToolSelectItem[]>(() => [
    {
      value: tools.HalfStitch,
      label: fluent.$t("stitch-half"),
      icon: "stitch-half",
      shortcut: "H",
    },
    {
      value: tools.HalfStitchForward,
      label: fluent.$t("stitch-half-forward"),
      icon: "stitch-half-forward",
      shortcut: "H-F",
    },
    {
      value: tools.HalfStitchBackward,
      label: fluent.$t("stitch-half-backward"),
      icon: "stitch-half-backward",
      shortcut: "H-B",
    },
  ]);

  const quarterstitches = computed<ToolSelectItem[]>(() => [
    {
      value: tools.QuarterStitch,
      label: fluent.$t("stitch-quarter"),
      icon: "stitch-quarter",
      shortcut: "Q",
    },
    {
      value: tools.QuarterStitchTL,
      label: fluent.$t("stitch-quarter-tl"),
      icon: "stitch-quarter-tl",
      shortcut: "Q-T-L",
    },
    {
      value: tools.QuarterStitchTR,
      label: fluent.$t("stitch-quarter-tr"),
      icon: "stitch-quarter-tr",
      shortcut: "Q-T-R",
    },
    {
      value: tools.QuarterStitchBR,
      label: fluent.$t("stitch-quarter-br"),
      icon: "stitch-quarter-br",
      shortcut: "Q-B-R",
    },
    {
      value: tools.QuarterStitchBL,
      label: fluent.$t("stitch-quarter-bl"),
      icon: "stitch-quarter-bl",
      shortcut: "Q-B-L",
    },
  ]);

  const linestitches = computed<ToolSelectItem[]>(() => [
    {
      value: tools.BackStitch,
      label: fluent.$t("stitch-back"),
      icon: "stitch-back",
      shortcut: "S",
    },
    {
      value: tools.StraightStitch,
      label: fluent.$t("stitch-straight"),
      icon: "stitch-straight",
      shortcut: "S-S",
    },
  ]);

  const nodestitches = computed<ToolSelectItem[]>(() => [
    {
      value: tools.FrenchKnot,
      label: fluent.$t("stitch-french-knot"),
      icon: "stitch-french-knot",
      shortcut: "K",
    },
    {
      value: tools.Bead,
      label: fluent.$t("stitch-bead"),
      icon: "stitch-bead",
      shortcut: "J",
    },
  ]);

  const eraser = computed<ToolSelectItem[]>(() => [
    {
      value: tools.Eraser,
      label: fluent.$t("palette-toolbar-eraser"),
      icon: "eraser",
      shortcut: "E",
    },
  ]);

  const cursor = computed<ToolSelectItem[]>(() => [
    {
      value: tools.Cursor,
      label: fluent.$t("palette-toolbar-cursor"),
      icon: "cursor",
      shortcut: "C",
    },
  ]);

  return { fullstitches, petitestitches, halfstitches, quarterstitches, linestitches, nodestitches, eraser, cursor };
}
