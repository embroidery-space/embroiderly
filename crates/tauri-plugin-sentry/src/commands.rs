#[derive(Debug, Clone, serde::Deserialize)]
#[serde(untagged)]
pub enum Buffer {
  Text(String),
  Raw(Vec<u8>),
}

#[tauri::command]
pub fn envelope(body: Buffer, sentry_client: tauri::State<'_, sentry::Client>) {
  let buffer = match body {
    Buffer::Text(str) => str.into_bytes(),
    Buffer::Raw(vec) => vec,
  };

  if let Ok(envelope) = sentry::Envelope::from_slice(&buffer) {
    if let Some(mut event) = envelope.event().cloned() {
      event.platform = "javascript".into();

      // Remove values from JavaScript, as they should be replaced by values from Rust.
      event.release = None;
      event.environment = None;
      event.dist = None;

      // We delete the user agent header so Sentry doesn't display weird browsers.
      if let Some(ref mut req) = event.request {
        req.headers.remove("User-Agent");
      }

      // We need to pull any attachments out of the envelope and add them to the scope when we capture the event.
      let attachments = envelope
        .items()
        .filter_map(|item| match item {
          sentry::protocol::EnvelopeItem::Attachment(attachment) => Some(attachment.clone()),
          _ => None,
        })
        .collect::<Vec<_>>();

      sentry::with_scope(
        |scope| {
          for attachment in attachments {
            scope.add_attachment(attachment);
          }
        },
        || sentry::capture_event(event),
      );
    } else {
      sentry_client.send_envelope(envelope);
    }
  }
}

#[tauri::command]
pub fn add_breadcrumb(breadcrumb: sentry::Breadcrumb) {
  sentry::add_breadcrumb(breadcrumb);
}
