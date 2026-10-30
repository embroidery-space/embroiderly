use std::str::FromStr as _;

use embroiderly_pattern::*;
use typst::foundations::{Dict, IntoValue as _, Symbol, Value};
use typst::visualize::Color;

pub fn convert_embproj_into_typst_value(embproj: EmbroiderlyProject) -> Value {
  let (positions, remap) = {
    let positions = embproj.pattern.palette.positions();

    let mut remap = vec![0u32; positions.len()];
    for (display_index, &actual_index) in positions.iter().enumerate() {
      remap[actual_index as usize] = display_index as u32;
    }

    (positions, remap)
  };
  let layer = embproj.pattern.flatten_visible_layers();

  let mut dict = Dict::new();

  dict.insert("info".into(), convert_pattern_info(&embproj.pattern.info));

  dict.insert("fabric".into(), convert_fabric(&embproj.pattern.fabric));
  dict.insert("grid".into(), convert_grid(&embproj.display_settings.grid));

  dict.insert(
    "palette".into(),
    Value::Array(
      positions
        .iter()
        .map(|&index| convert_palette_item(&embproj.pattern.palette[index]))
        .collect(),
    ),
  );

  dict.insert(
    "fullstitches".into(),
    Value::Array(
      layer
        .fullstitches
        .iter()
        .map(|s| {
          convert_full_stitch(FullStitch {
            palindex: remap[s.palindex as usize],
            ..*s
          })
        })
        .collect(),
    ),
  );

  dict.insert(
    "partstitches".into(),
    Value::Array(
      layer
        .partstitches
        .iter()
        .map(|s| {
          convert_part_stitch(PartStitch {
            palindex: remap[s.palindex as usize],
            ..*s
          })
        })
        .collect(),
    ),
  );

  dict.insert(
    "linestitches".into(),
    Value::Array(
      layer
        .linestitches
        .iter()
        .map(|s| {
          convert_line_stitch(LineStitch {
            palindex: remap[s.palindex as usize],
            ..*s
          })
        })
        .collect(),
    ),
  );

  dict.insert(
    "nodestitches".into(),
    Value::Array(
      layer
        .nodestitches
        .iter()
        .map(|s| {
          convert_node_stitch(NodeStitch {
            palindex: remap[s.palindex as usize],
            ..*s
          })
        })
        .collect(),
    ),
  );

  Value::Dict(dict)
}

fn convert_pattern_info(info: &PatternInfo) -> Value {
  let mut dict = Dict::new();

  dict.insert("title".into(), info.title.as_str().into_value());
  dict.insert("author".into(), info.author.as_str().into_value());
  dict.insert("copyright".into(), info.copyright.as_str().into_value());
  dict.insert("description".into(), info.description.as_str().into_value());

  Value::Dict(dict)
}

fn convert_fabric(fabric: &Fabric) -> Value {
  let mut dict = Dict::new();

  dict.insert("width".into(), fabric.width.into_value());
  dict.insert("height".into(), fabric.height.into_value());
  dict.insert("count".into(), fabric.count.into_value());
  dict.insert("kind".into(), fabric.kind.as_str().into_value());
  dict.insert("name".into(), fabric.name.as_str().into_value());
  dict.insert("color".into(), Value::Color(Color::from_str(&fabric.color).unwrap()));

  Value::Dict(dict)
}

fn convert_grid(grid: &Grid) -> Value {
  let mut dict = Dict::new();

  dict.insert("major-lines-interval".into(), grid.major_lines_interval.into_value());
  dict.insert("minor-lines".into(), convert_grid_line(&grid.minor_lines).into_value());
  dict.insert("major-lines".into(), convert_grid_line(&grid.major_lines).into_value());

  Value::Dict(dict)
}

fn convert_grid_line(grid_line: &GridLine) -> Value {
  let mut dict = Dict::new();

  dict.insert("color".into(), Value::Color(Color::from_str(&grid_line.color).unwrap()));
  dict.insert(
    "thickness".into(),
    if grid_line.pixel_line {
      1.into_value()
    } else {
      grid_line.thickness.into_value()
    },
  );

  Value::Dict(dict)
}

fn convert_palette_item(palitem: &PaletteItem) -> Value {
  let mut dict = Dict::new();

  dict.insert("brand".into(), palitem.brand.as_str().into_value());
  dict.insert("number".into(), palitem.number.as_str().into_value());
  dict.insert("name".into(), palitem.name.as_str().into_value());
  dict.insert("color".into(), Value::Color(Color::from_str(&palitem.color).unwrap()));
  dict.insert(
    "symbol".into(),
    match palitem.symbol.as_ref() {
      None => Value::None,
      Some(symbol) => {
        let mut dict = Dict::new();

        dict.insert("char".into(), Value::Symbol(Symbol::runtime_char(symbol.char)));
        dict.insert("font".into(), symbol.font.as_str().into_value());

        Value::Dict(dict)
      }
    },
  );

  Value::Dict(dict)
}

fn convert_full_stitch(stitch: FullStitch) -> Value {
  let mut dict = Dict::new();

  dict.insert("x".into(), stitch.x.into_inner().into_value());
  dict.insert("y".into(), stitch.y.into_inner().into_value());
  dict.insert("palindex".into(), stitch.palindex.into_value());
  dict.insert(
    "kind".into(),
    match stitch.kind {
      FullStitchKind::Full => "full".into_value(),
      FullStitchKind::Petite => "petite".into_value(),
    },
  );

  Value::Dict(dict)
}

fn convert_part_stitch(stitch: PartStitch) -> Value {
  let mut dict = Dict::new();

  dict.insert("x".into(), stitch.x.into_inner().into_value());
  dict.insert("y".into(), stitch.y.into_inner().into_value());
  dict.insert("palindex".into(), stitch.palindex.into_value());
  dict.insert(
    "direction".into(),
    match stitch.direction {
      PartStitchDirection::Forward => "forward".into_value(),
      PartStitchDirection::Backward => "backward".into_value(),
    },
  );
  dict.insert(
    "kind".into(),
    match stitch.kind {
      PartStitchKind::Half => "half".into_value(),
      PartStitchKind::Quarter => "quarter".into_value(),
    },
  );

  Value::Dict(dict)
}

fn convert_line_stitch(stitch: LineStitch) -> Value {
  let mut dict = Dict::new();

  dict.insert(
    "x".into(),
    [stitch.x.0.into_inner(), stitch.x.1.into_inner()].into_value(),
  );
  dict.insert(
    "y".into(),
    [stitch.y.0.into_inner(), stitch.y.1.into_inner()].into_value(),
  );
  dict.insert("palindex".into(), stitch.palindex.into_value());
  dict.insert(
    "kind".into(),
    match stitch.kind {
      LineStitchKind::Back => "back".into_value(),
      LineStitchKind::Straight => "straight".into_value(),
    },
  );

  Value::Dict(dict)
}

fn convert_node_stitch(stitch: NodeStitch) -> Value {
  let mut dict = Dict::new();

  dict.insert("x".into(), stitch.x.into_inner().into_value());
  dict.insert("y".into(), stitch.y.into_inner().into_value());
  dict.insert("rotated".into(), stitch.rotated.into_value());
  dict.insert("palindex".into(), stitch.palindex.into_value());
  dict.insert(
    "kind".into(),
    match stitch.kind {
      NodeStitchKind::Bead => "bead".into_value(),
      NodeStitchKind::FrenchKnot => "french-knot".into_value(),
    },
  );

  Value::Dict(dict)
}
