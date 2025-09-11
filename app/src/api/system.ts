import { invoke } from "./index.ts";

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
