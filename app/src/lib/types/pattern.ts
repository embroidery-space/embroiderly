export const enum LayerLayout {
  ByStitchType = "stitch-type",
  ByLayerOrder = "layer-order",
}

export interface PatternOptions {
  /**
   * The layout in which per-layer stitch containers are assembled into the scene graph.
   * @default LayerLayout.ByStitchType
   */
  layerLayout?: LayerLayout;
}
