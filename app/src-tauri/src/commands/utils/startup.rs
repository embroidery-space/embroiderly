use crate::state::{StartupNotification, StartupNotificationsState};

#[tracing::instrument(level = "trace", skip_all, ret)]
#[tauri::command]
pub fn get_startup_notifications(notifications: tauri::State<StartupNotificationsState>) -> Vec<StartupNotification> {
  notifications.lock().unwrap().take_all()
}
