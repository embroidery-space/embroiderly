//! Wasm tracing subscriber that forwards formatted log events to the frontend `LoggerService`.
//!
//! `tracing-wasm`/`tracing-web` are not used here because they hard-code `console.*` as the only sink.
//! A custom [`MakeWriter`](tracing_subscriber::fmt::MakeWriter) gives us full control:
//! every event is routed through the `LoggerService` singleton, which already dual-routes to
//! `console.*` and the Tauri `plugin:log|log` command and can gain new sinks in one place.

use tracing_subscriber::fmt::format::FmtSpan;
use tracing_subscriber::layer::SubscriberExt as _;
use tracing_subscriber::util::SubscriberInitExt as _;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(module = "~/services/logger.service.ts")]
extern "C" {
  #[wasm_bindgen(js_name = LoggerServiceClass)]
  pub type LoggerService;

  /// The singleton instance exported as `LoggerService` from the TS module.
  /// `thread_local_v2` is required because `JsValue`-backed statics are not `Sync`.
  #[wasm_bindgen(thread_local_v2, js_name = LoggerService)]
  static LOGGER: LoggerService;

  /// `structural` skips prototype lookups---we only need a callable `log` method on the object.
  #[wasm_bindgen(method, structural, js_name = log)]
  fn log(this: &LoggerService, level: &str, message: &str, options: &JsValue);
}

/// Buffers a single formatted event and dispatches it on drop via `LoggerService.log`.
struct JsSinkWriter {
  buffer: Vec<u8>,
  level: &'static str,
  location: String,
}

impl std::io::Write for JsSinkWriter {
  fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
    self.buffer.extend_from_slice(buf);
    Ok(buf.len())
  }

  fn flush(&mut self) -> std::io::Result<()> {
    Ok(())
  }
}

impl Drop for JsSinkWriter {
  fn drop(&mut self) {
    let message = String::from_utf8_lossy(&self.buffer).trim_end().to_string();
    if message.is_empty() {
      return;
    }

    let options = js_sys::Object::new();
    js_sys::Reflect::set(
      &options,
      &JsValue::from_str("location"),
      &JsValue::from_str(&self.location),
    )
    .ok();

    LOGGER.with(|l| l.log(self.level, &message, options.as_ref()));
  }
}

struct MakeJsSinkWriter;

impl<'a> tracing_subscriber::fmt::MakeWriter<'a> for MakeJsSinkWriter {
  type Writer = JsSinkWriter;

  fn make_writer(&'a self) -> Self::Writer {
    JsSinkWriter {
      buffer: Vec::new(),
      level: "TRACE",
      location: String::new(),
    }
  }

  fn make_writer_for(&'a self, meta: &tracing::Metadata<'_>) -> Self::Writer {
    let location = match (meta.file(), meta.line()) {
      (Some(f), Some(l)) => format!("{f}:{l}"),
      (Some(f), None) => f.to_string(),
      _ => String::new(),
    };
    JsSinkWriter {
      buffer: Vec::new(),
      level: meta.level().as_str(),
      location,
    }
  }
}

pub fn init() {
  tracing_subscriber::registry()
    .with(embroiderly_tracing::default_env_filter())
    .with(
      tracing_subscriber::fmt::layer()
        .with_ansi(false)
        // Level is passed separately to `LoggerService.log`.
        .with_level(false)
        // File and line are passed via `LogOptions.location`.
        .with_file(false)
        .with_line_number(false)
        // `Instant::now()` panics on `wasm32-unknown-unknown`.
        .without_time()
        // Keep the module path in the message body which is useful for log filtering.
        .with_target(true)
        .with_span_events(FmtSpan::NEW | FmtSpan::CLOSE)
        .with_writer(MakeJsSinkWriter),
    )
    .init();

  std::panic::set_hook(Box::new(|info| {
    console_error_panic_hook::hook(info);
    tracing_panic::panic_hook(info);
  }));
}
