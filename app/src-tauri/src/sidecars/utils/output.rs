use tauri::async_runtime::Receiver;
use tauri_plugin_shell::process::{Command, CommandEvent};

use crate::error::Result;
use crate::sidecars::{ExitStatus, Output};

/// Spawns and collects the **binary** output of a sidecar process.
pub async fn collect_sidecar_binary_output_from_command(command: Command) -> Result<Output> {
  let (mut rx, _child) = command
    .spawn()
    .map_err(|e| anyhow::anyhow!("Failed to spawn sidecar process: {e}"))?;

  let mut code = None;
  let mut stdout = Vec::new();
  let mut stderr = Vec::new();

  while let Some(event) = rx.recv().await {
    match event {
      CommandEvent::Terminated(payload) => code = payload.code,
      CommandEvent::Stdout(line) => stdout.extend(line),
      CommandEvent::Stderr(line) => stderr.extend(line),
      _ => {}
    }
  }

  Ok(Output {
    status: ExitStatus { code },
    stdout,
    stderr,
  })
}

/// Collects the **binary** output of an already spawned sidecar process.
pub async fn collect_sidecar_binary_output_from_receiver(mut rx: Receiver<CommandEvent>) -> Result<Output> {
  let mut code = None;
  let mut stdout = Vec::new();
  let mut stderr = Vec::new();

  while let Some(event) = rx.recv().await {
    match event {
      CommandEvent::Terminated(payload) => code = payload.code,
      CommandEvent::Stdout(line) => stdout.extend(line),
      CommandEvent::Stderr(line) => stderr.extend(line),
      _ => {}
    }
  }

  Ok(Output {
    status: ExitStatus { code },
    stdout,
    stderr,
  })
}

/// Handle sidecar output and capture failure to Sentry if enabled.
pub fn handle_sidecar_output(output: Output, sidecar_name: &str) -> Result<Output> {
  // Handle sidecar failure and capture to Sentry if enabled.
  if !output.status.success() {
    let exit_code = output.status.code();

    let error_message = format!("Sidecar '{sidecar_name}' failed with exit code {exit_code:?}");
    tracing::error!(error_message);

    return Err(anyhow::anyhow!("{error_message}").into());
  }

  Ok(output)
}
