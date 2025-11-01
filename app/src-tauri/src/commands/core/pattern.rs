use embroiderly_pattern::PatternInfo;

use crate::core::actions::{Action as _, UpdatePatternInfoAction};
use crate::error::Result;
use crate::parse_command_payload;
use crate::state::{HistoryState, PatternsState};

#[tauri::command]
pub fn update_pattern_info<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id, pattern_info) = parse_command_payload!(request, PatternInfo);

  let mut patterns = patterns.write().unwrap();
  let action = UpdatePatternInfoAction::new(pattern_info);
  action.perform(&window, patterns.get_mut_pattern_by_id(&pattern_id).unwrap())?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).unwrap().push(Box::new(action));

  Ok(())
}
