mod error;

mod parsers;
pub use parsers::palette::{parse_palette, parse_palette_from_bytes};
pub use parsers::xsd::parse_pattern;

mod schemas;
pub use schemas::xsd::*;
