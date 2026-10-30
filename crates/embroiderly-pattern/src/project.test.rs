use super::*;

#[test]
fn creates_new_embproj_with_defaults() {
  let embproj = EmbroiderlyProject::new(Pattern::default());

  assert!(!embproj.id.is_nil());

  assert!(embproj.reference_image.is_none());

  assert_eq!(embproj.display_settings, DisplaySettings::default());
}

#[test]
fn builder_sets_pattern_pdf() {
  let pattern_pdf = PatternPdf {
    template: String::from("qwerty"),
  };

  let embproj = EmbroiderlyProject::builder(Pattern::default())
    .pattern_pdf(pattern_pdf.clone())
    .build();

  assert_eq!(embproj.pattern_pdf, pattern_pdf);
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
fn each_build_creates_unique_id() {
  let embproj1 = EmbroiderlyProject::new(Pattern::default());
  let embproj2 = EmbroiderlyProject::new(Pattern::default());

  assert_ne!(embproj1.id, embproj2.id);
}

#[test]
fn from_pattern_creates_embproj() {
  let embproj: EmbroiderlyProject = Pattern::default().into();

  assert!(!embproj.id.is_nil());
}
