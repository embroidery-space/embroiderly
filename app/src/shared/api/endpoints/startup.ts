import { invoke } from "../client.ts";

export type StartupNotification = { fileAssociationFailed: string } | { templateFailed: string };

export function getStartupNotifications() {
  return invoke<StartupNotification[]>("get_startup_notifications");
}
