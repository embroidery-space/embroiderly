use typst::syntax::{FileId, RootedPath, VirtualPath, VirtualRoot};

pub fn project_path(path: String) -> FileId {
  RootedPath::new(VirtualRoot::Project, VirtualPath::new(path).unwrap()).intern()
}
