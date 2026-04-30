use super::*;

#[test]
fn creates_new_patproj_with_defaults() {
  let patproj = PatternProject::new(Pattern::default());

  assert!(!patproj.id.is_nil());
  assert!(patproj.file_path.is_none());

  assert!(patproj.reference_image.is_none());

  assert_eq!(patproj.display_settings, DisplaySettings::default());
  assert_eq!(patproj.publish_settings, PublishSettings::default());
}

#[test]
fn builder_sets_file_path() {
  let patproj = PatternProject::builder(Pattern::default())
    .file_path("test/pattern.embproj")
    .build();

  assert_eq!(patproj.file_path, Some(PathBuf::from("test/pattern.embproj")));
}

#[test]
fn builder_sets_display_settings() {
  let display_settings = DisplaySettings {
    show_symbols: true,
    ..Default::default()
  };

  let patproj = PatternProject::builder(Pattern::default())
    .display_settings(display_settings.clone())
    .build();

  assert_eq!(patproj.display_settings, display_settings);
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

  let patproj = PatternProject::builder(Pattern::default())
    .publish_settings(publish_settings.clone())
    .build();

  assert_eq!(patproj.publish_settings, publish_settings);
}

#[test]
fn each_build_creates_unique_id() {
  let patproj1 = PatternProject::new(Pattern::default());
  let patproj2 = PatternProject::new(Pattern::default());

  assert_ne!(patproj1.id, patproj2.id);
}

#[test]
fn from_pattern_creates_patproj() {
  let patproj: PatternProject = Pattern::default().into();

  assert!(!patproj.id.is_nil());
  assert!(patproj.file_path.is_none());
}
