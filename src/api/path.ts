import { invoke } from "@tauri-apps/api/core";

export function getAppDocumentDir() {
  return invoke<string>("get_app_document_dir");
}
