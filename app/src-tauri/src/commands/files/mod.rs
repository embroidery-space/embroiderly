pub mod export;
pub mod fonts;
pub mod import;
pub mod palettes;
pub mod patterns;

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportFilesResponse {
  pub failed_files: Vec<String>,
}

#[derive(serde::Serialize)]
pub struct GroupedFilesList {
  pub system: Vec<String>,
  pub custom: Vec<String>,
}

#[derive(Debug, serde::Deserialize)]
pub enum FileGroup {
  #[serde(rename = "system")]
  System,
  #[serde(rename = "custom")]
  Custom,
}
