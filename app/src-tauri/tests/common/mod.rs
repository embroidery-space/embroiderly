/// Sets up a test app with the provided commands and plugins.
///
/// Usage:
///
/// ```rust
/// setup_test_app!(
///     commands: [
///         commands::core::pattern::create_pattern
///     ],
///     plugins: [
///         tauri_plugin_pinia::init()
///     ]
/// )
/// ```
#[macro_export]
macro_rules! setup_test_app {
  (commands: [$($cmd:path),* $(,)?], plugins: [$($plugin:expr),* $(,)?]) => {{
    use tauri::test::{mock_builder, mock_context, noop_assets, MockRuntime};

    // Configure app.
    let builder = mock_builder()
      .setup(|app| {
        let app_handle = app.handle();

        embroiderly::vendor::logger::init(app_handle)?;
        embroiderly::vendor::telemetry::init(app_handle)?;

        Ok(())
      })
      .manage(std::sync::RwLock::new(embroiderly::state::PatternManager::new()))
      .manage(std::sync::RwLock::new(embroiderly::state::HistoryManager::<MockRuntime>::new()))
      .invoke_handler(tauri::generate_handler![$($cmd),*]) // Register provided commands.
      $(.plugin($plugin))*; // Register provided plugins.

    let app = builder.build(mock_context(noop_assets())).unwrap();

    let app_handle = app.handle().clone();
    let webview_window = tauri::WebviewWindowBuilder::new(&app_handle, "main", Default::default()).build().unwrap();

    // Emulate app launch.
    // This is needed to execute the `setup` hook which is used by us to register some services.
    std::thread::spawn(move || {
      app.run(|_, _| {});
    });

    // Wait some time for the application to be launched to ensure that the app is properly set up.
    std::thread::sleep(std::time::Duration::from_secs(1));

    (app_handle, webview_window)
  }};
}
