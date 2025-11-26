import { invoke } from "~/shared/api/";

// === Paths ===

export function getAppDocumentDir() {
  return invoke<string>("get_app_document_dir");
}

// === System ===

export interface SystemInfo {
  osType: string;
  osArch: string;
  osVersion: string;
  appVersion: string;
  webviewVersion: string;
}

export function getSystemInfo() {
  return invoke<SystemInfo>("get_system_info");
}
