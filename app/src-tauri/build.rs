fn main() {
  let attributes = tauri_build::Attributes::new()
    .plugin("log", tauri_build::InlinedPlugin::new().commands(&["log"]))
    .plugin(
      "sentry",
      tauri_build::InlinedPlugin::new().commands(&["envelope", "add_breadcrumb"]),
    );

  #[cfg(all(target_os = "windows", target_env = "msvc", feature = "test"))]
  {
    let attributes = attributes.windows_attributes(tauri_build::WindowsAttributes::new_without_app_manifest());
    tauri_build::try_build(attributes).expect("failed to run tauri-build");

    let manifest = std::env::current_dir()
      .unwrap()
      .join("testdata/")
      .join("windows-app-manifest.xml");

    // Workaround needed to prevent `STATUS_ENTRYPOINT_NOT_FOUND` error in tests on Windows.
    // See https://github.com/tauri-apps/tauri/discussions/11179.
    println!("cargo:rerun-if-changed={}", manifest.display());
    println!("cargo:rustc-link-arg=/MANIFEST:EMBED"); // Embed the Windows application manifest file.
    println!("cargo:rustc-link-arg=/MANIFESTINPUT:{}", manifest.to_str().unwrap());
    println!("cargo:rustc-link-arg=/WX"); // Turn linker warnings into errors.
  }

  // Keep the default build script for other cases.
  #[cfg(not(all(target_os = "windows", target_env = "msvc", feature = "test")))]
  tauri_build::try_build(attributes).expect("failed to run tauri-build");
}
