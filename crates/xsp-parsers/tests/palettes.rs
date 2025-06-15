macro_rules! parse_all_palettes {
  ($name:ident) => {
    paste::paste! {
      #[test]
      fn [<parses_all_ $name _palettes>]() {
        let palettes_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
          .join(format!("testdata/{}/palettes", stringify!($name)));
        for entry in palettes_path.read_dir().unwrap() {
          let path = entry.unwrap().path();
          let palette = xsp_parsers::$name::parse_palette(path.clone());
          assert!(palette.is_ok(), "Failed to parse {:?}", path);
        }
      }
    }
  };
}

parse_all_palettes!(pmaker);

parse_all_palettes!(ursa);

parse_all_palettes!(xspro);
