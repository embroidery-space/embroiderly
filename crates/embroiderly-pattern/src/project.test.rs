use super::*;

#[test]
fn creates_new_embproj_with_defaults() {
  let embproj = EmbroiderlyProject::new(Pattern::default());

  assert!(!embproj.id.is_nil());
  assert!(embproj.file_path.is_none());

  assert!(embproj.reference_image.is_none());

  assert_eq!(embproj.display_settings, DisplaySettings::default());
  assert_eq!(embproj.publish_settings, PublishSettings::default());
}

#[test]
fn builder_sets_file_path() {
  let embproj = EmbroiderlyProject::builder(Pattern::default())
    .file_path("test/pattern.embproj")
    .build();

  assert_eq!(embproj.file_path, Some(PathBuf::from("test/pattern.embproj")));
}

#[test]
fn builder_sets_display_settings() {
  let display_settings = DisplaySettings {
    show_symbols: true,
    ..Default::default()
  };

  let embproj = EmbroiderlyProject::builder(Pattern::default())
    .display_settings(display_settings.clone())
    .build();

  assert_eq!(embproj.display_settings, display_settings);
}

#[test]
fn builder_sets_publish_settings() {
  let publish_settings = PublishSettings {
    pdf: crate::PdfExportOptions {
      center_frames: true, // `false` by default
      ..Default::default()
    },
    ..Default::default()
  };

  let embproj = EmbroiderlyProject::builder(Pattern::default())
    .publish_settings(publish_settings.clone())
    .build();

  assert_eq!(embproj.publish_settings, publish_settings);
}

#[test]
fn each_build_creates_unique_id() {
  let embproj1 = EmbroiderlyProject::new(Pattern::default());
  let embproj2 = EmbroiderlyProject::new(Pattern::default());

  assert_ne!(embproj1.id, embproj2.id);
}

#[test]
fn from_pattern_creates_embproj() {
  let embproj: EmbroiderlyProject = Pattern::default().into();

  assert!(!embproj.id.is_nil());
  assert!(embproj.file_path.is_none());
}
