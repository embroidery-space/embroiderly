use embroiderly_pattern::{
  DisplaySettings, Fabric, Grid, Layer, PaletteItem, PaletteSettings, PatternInfo, PdfExportOptions, ReferenceImage,
  ReferenceImageSettings, Stitch, Symbol,
};

use crate::actions::layers::LayerVisibility;

/// Events that can be emitted by the editor.
/// Each event represents a specific change in the associated pattern project.
#[derive(Debug, Clone, borsh::BorshSerialize, borsh::BorshDeserialize)]
pub enum EditorEvent {
  StitchesAdd {
    layer_index: u32,
    stitches: Vec<Stitch>,
  },
  StitchesRemove {
    layer_index: u32,
    stitches: Vec<Stitch>,
  },

  FabricUpdate(Fabric),

  PaletteAddItem {
    palitem: PaletteItem,
    palindex: u32,
  },
  PaletteRemoveItems(Vec<u32>),
  PaletteUpdateDisplaySettings(PaletteSettings),
  PaletteSort(Vec<u32>),
  PaletteReorder(Vec<u32>),
  PaletteSetSymbol {
    palindex: u32,
    symbol: Option<Symbol>,
  },

  PatternInfoUpdate(PatternInfo),

  DisplayUpdate(DisplaySettings),

  GridUpdate(Grid),

  LayerAdd {
    index: u32,
    layer: Layer,
  },
  LayerRemove(u32),
  LayerRename {
    layer_index: u32,
    name: String,
  },
  LayerUpdateVisibility {
    layer_index: u32,
    visibility: LayerVisibility,
  },
  LayerMove(Vec<u32>),

  PublishUpdatePdf(PdfExportOptions),

  ImageSet(Option<ReferenceImage>),
  ImageSettingsUpdate(ReferenceImageSettings),

  PatternChanged(uuid::Uuid),    // Used for marking the pattern as dirty.
  PatternCheckpoint(uuid::Uuid), // Used for marking the pattern as clean (not dirty, saved).
  PatternSaved(uuid::Uuid),      // Used for notifiyng the user about a successful save.
}
