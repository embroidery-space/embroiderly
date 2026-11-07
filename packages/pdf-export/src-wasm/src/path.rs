use typst::syntax::{FileId, RootedPath, VirtualPath, VirtualRoot};

pub fn project_path(path: impl AsRef<str>) -> FileId {
  RootedPath::new(VirtualRoot::Project, VirtualPath::new(path).unwrap()).intern()
}
