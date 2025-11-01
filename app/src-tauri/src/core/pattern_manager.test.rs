use std::path::PathBuf;

use uuid::Uuid;

use super::*;

fn create_test_pattern(id: Uuid, file_path: PathBuf) -> PatternProject {
  PatternProject {
    id,
    file_path,
    ..Default::default()
  }
}

#[test]
fn test_new_pattern_manager() {
  let pm = PatternManager::new();
  assert!(pm.get_pattern_by_id(&Uuid::new_v4()).is_none());
  assert!(pm.get_pattern_by_path(&PathBuf::from("pattern.xsd")).is_none());
}

#[test]
fn test_add_and_get_pattern() {
  let mut pm = PatternManager::new();

  let pattern_id = Uuid::new_v4();
  let pattern_path = PathBuf::from("pattern.xsd");

  let pattern = create_test_pattern(pattern_id, pattern_path.clone());
  pm.add_pattern(pattern);

  // Test get_pattern_by_id
  let retrieved_by_id = pm.get_pattern_by_id(&pattern_id);
  assert!(retrieved_by_id.is_some());
  assert_eq!(retrieved_by_id.unwrap().id, pattern_id);
  assert_eq!(retrieved_by_id.unwrap().file_path, pattern_path);

  // Test get_pattern_by_path
  let retrieved_by_path = pm.get_pattern_by_path(&pattern_path);
  assert!(retrieved_by_path.is_some());
  assert_eq!(retrieved_by_path.unwrap().id, pattern_id);
  assert_eq!(retrieved_by_path.unwrap().file_path, pattern_path);
}

#[test]
fn test_get_mut_pattern_by_id() {
  let mut pm = PatternManager::new();

  let pattern_id = Uuid::new_v4();
  let pattern = create_test_pattern(pattern_id, PathBuf::from("pattern.xsd"));
  pm.add_pattern(pattern);

  let new_title = "Updated Pattern Title";
  if let Some(mut_pattern) = pm.get_mut_pattern_by_id(&pattern_id) {
    mut_pattern.pattern.info.title = String::from(new_title);
  }

  let retrieved_pattern = pm.get_pattern_by_id(&pattern_id);
  assert!(retrieved_pattern.is_some());
  assert_eq!(retrieved_pattern.unwrap().pattern.info.title, new_title);
}

#[test]
fn test_remove_pattern() {
  let mut pm = PatternManager::new();

  let pattern_id = Uuid::new_v4();
  let pattern_path = PathBuf::from("pattern.xsd");

  let pattern = create_test_pattern(pattern_id, pattern_path.clone());
  pm.add_pattern(pattern);

  // Ensure pattern is there before removal
  assert!(pm.get_pattern_by_id(&pattern_id).is_some());
  assert!(pm.get_pattern_by_path(&pattern_path).is_some());

  // Remove the pattern
  let removed_pattern = pm.remove_pattern(&pattern_id);
  assert!(removed_pattern.is_some());
  assert_eq!(removed_pattern.unwrap().id, pattern_id);

  // Ensure pattern is gone after removal
  assert!(pm.get_pattern_by_id(&pattern_id).is_none());
  assert!(pm.get_pattern_by_path(&pattern_path).is_none());
}

#[test]
fn test_get_non_existent_pattern() {
  let pm = PatternManager::new();
  let random_id = Uuid::new_v4();
  let random_path = PathBuf::from("pattern.xsd");

  assert!(pm.get_pattern_by_id(&random_id).is_none());
  assert!(pm.get_pattern_by_path(&random_path).is_none());
}

#[test]
fn test_remove_non_existent_pattern() {
  let mut pm = PatternManager::new();
  let random_id = Uuid::new_v4();
  assert!(pm.remove_pattern(&random_id).is_none());
}

#[test]
fn test_add_multiple_patterns() {
  let mut pm = PatternManager::new();
  let pattern_id1 = Uuid::new_v4();
  let pattern_path1 = PathBuf::from("pattern1.xsd");
  let pattern1 = create_test_pattern(pattern_id1, pattern_path1.clone());

  let pattern_id2 = Uuid::new_v4();
  let pattern_path2 = PathBuf::from("pattern2.xsd");
  let pattern2 = create_test_pattern(pattern_id2, pattern_path2.clone());

  pm.add_pattern(pattern1);
  pm.add_pattern(pattern2);

  assert!(pm.get_pattern_by_id(&pattern_id1).is_some());
  assert!(pm.get_pattern_by_path(&pattern_path1).is_some());
  assert!(pm.get_pattern_by_id(&pattern_id2).is_some());
  assert!(pm.get_pattern_by_path(&pattern_path2).is_some());
}
