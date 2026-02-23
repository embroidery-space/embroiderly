import { invoke } from "../client.ts";

export function getAppDocumentDir() {
  return invoke<string>("get_app_document_dir");
}
