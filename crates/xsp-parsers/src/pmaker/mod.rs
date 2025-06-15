mod error;

mod parsers;
pub use parsers::palette::parse_palette;
pub use parsers::xsd::parse_pattern;

mod schemas;
pub use schemas::xsd::*;
