use super::parse_palette_item;

#[test]
fn parses_palette_item() {
  let palette_item = parse_palette_item(r#""DMC    310","Black",789516"#);
  assert!(palette_item.is_ok());

  let palette_item = palette_item.unwrap();
  assert!(palette_item.is_some());

  let palette_item = palette_item.unwrap();
  assert_eq!(palette_item.brand, "DMC");
  assert_eq!(palette_item.number, "310");
  assert_eq!(palette_item.name, "Black");
  assert_eq!(palette_item.color, "0C0C0C");
}

#[test]
fn returns_none_on_invalid_palette_item() {
  let palette_item = parse_palette_item(r#""Black",789516"#).unwrap();
  assert!(palette_item.is_none());

  let palette_item = parse_palette_item(r#""DMC    310",789516"#).unwrap();
  assert!(palette_item.is_none());

  let palette_item = parse_palette_item(r#""DMC    310","Black""#).unwrap();
  assert!(palette_item.is_none());
}

#[test]
fn returns_none_on_stop() {
  let palette_item = parse_palette_item(r#""STOP","",0"#);
  assert!(palette_item.is_ok());
  assert!(palette_item.unwrap().is_none());
}
