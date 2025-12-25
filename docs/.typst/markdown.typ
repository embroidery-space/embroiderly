// A special instruction to add a page break between groups of chapters.
#let pagebreak = "<!--raw-typst #pagebreak() -->\n"

// Removes the frontmatter from the provided Markdown text.
#let _remove-frontmatter(content) = {
  let lines = content.split("\n")
  if lines.len() > 0 and lines.at(0).trim() == "---" {
    for index in range(1, lines.len()) {
      if lines.at(index).trim() == "---" {
        if index + 1 < lines.len() {
          return lines.slice(index + 2).join("\n")
        } else {
          return ""
        }
      }
    }
  }
  content
}

// A custom function to read and preprocess Markdown files.
#let read(path) = {
  _remove-frontmatter(std.read(path))
}
