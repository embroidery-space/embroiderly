use crate::core::actions::{Action, UpdateFabricPropertiesAction};
use crate::core::pattern::Fabric;
use crate::error::CommandResult;
use crate::parse_command_payload;
use crate::state::{HistoryState, PatternsState};

#[tauri::command]
pub fn update_fabric<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> CommandResult<()> {
  let (pattern_id, fabric) = parse_command_payload!(request, Fabric);

  let mut patterns = patterns.write().unwrap();
  let action = UpdateFabricPropertiesAction::new(fabric);
  action.perform(&window, patterns.get_mut_pattern_by_id(&pattern_id).unwrap())?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(action));

  Ok(())
}
