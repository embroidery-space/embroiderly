fn main() {
  if let Ok(env_file) = dotenvy::dotenv() {
    println!("cargo:rerun-if-changed={}", env_file.display());
    for (key, value) in dotenvy::dotenv_iter().unwrap().flatten() {
      println!("cargo:rustc-env={key}={value}");
    }
  }

  let attributes = tauri_build::Attributes::new().plugin("log", tauri_build::InlinedPlugin::new().commands(&["log"]));

  #[cfg(all(target_os = "windows", target_env = "msvc", feature = "test"))]
  {
    let attributes = attributes.windows_attributes(tauri_build::WindowsAttributes::new_without_app_manifest());
    tauri_build::try_build(attributes).expect("failed to run tauri-build");

    let manifest = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
      .join("../../testdata/")
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
