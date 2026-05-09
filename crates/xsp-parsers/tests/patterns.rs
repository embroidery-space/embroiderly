macro_rules! parse_all_patterns {
  ($name:ident) => {
    paste::paste! {
      #[test]
      fn [<parses_all_ $name _patterns>]() {
        let patterns_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
          .join(format!("testdata/{}/patterns", stringify!($name)));
        for entry in patterns_path.read_dir().unwrap() {
          let path = entry.unwrap().path();
          let data = std::fs::read(&path).unwrap();

          let pattern = xsp_parsers::$name::parse_pattern(&data);

          assert!(pattern.is_ok(), "Failed to parse {:?}", path);
        }
      }
    }
  };
}

parse_all_patterns!(pmaker);
