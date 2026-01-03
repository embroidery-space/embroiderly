// A special instruction to add a page break between groups of chapters.
#let pagebreak = "<!--raw-typst #pagebreak() -->\n\n"

// Removes the frontmatter from the provided Markdown text.
#let _remove-frontmatter(content) = {
  let lines = content.split("\n")
  if lines.len() > 0 and lines.at(0).trim() == "---" {
    for index in range(1, lines.len()) {
      if lines.at(index).trim() == "---" {
        if index + 1 < lines.len() {
          return lines.slice(index + 1).join("\n")
        } else {
          return ""
        }
      }
    }
  }
  content
}

// Rewrites relative links to anchor-only links.
// Example: [text](./page#anchor) -> [text](#anchor)
//
// To generate a PDF, we merge all pages into a single string, so there are no more "pages," but only titles and their anchors.
// So, we need to fix links, so that they point to correct sections.
#let _rewrite-relative-links(content) = {
  content.replace(
    regex("\]\([^)]*/[^)#]*(#[^)]*)\)"),
    m => "](" + m.captures.first() + ")"
  )
}

// A custom function to read and preprocess Markdown files.
#let read(path) = {
  let content = std.read(path)
  content = _remove-frontmatter(content)
  content = _rewrite-relative-links(content)
  content
}
