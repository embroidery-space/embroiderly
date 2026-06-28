#let _styles = (
  "NOTE": rgb("#0969da"),
  "TIP": rgb("#1a7f37"),
  "IMPORTANT": rgb("#8250df"),
  "WARNING": rgb("#9a6700"),
  "CAUTION": rgb("#d1242f"),
)

#let _get-text(content) = {
  if content.has("text") {
    content.text
  } else if content.has("children") {
    content.children.map(_get-text).join("")
  } else if content.has("body") {
    _get-text(content.body)
  } else {
    ""
  }
}

// A custom quote function for admonitions (to be used in the cmarker's scope).
#let quote(body, block: false, attribution: none) = {
  assert(block, message: "Unexpect inline quote from cmarker")

  // Check if this is a GitHub-flawored admonition block.
  let match = _get-text(body).match(regex("^\\[!(\\w+)\\]\\s*"))
  if match != none {
    let type = upper(match.captures.at(0))
    let color = _styles.at(type, default: _styles.at("NOTE"))

    std.block(
      [
        #std.text(fill: color, weight: "bold")[#type]
        #v(0.5em, weak: true)

        #show regex("^\\[!(\\w+)\\]\\s*"): match => ""
        #std.text(fill: black)[#body]
      ],
      width: 100%,
      stroke: (left: 2pt + color),
      fill: color.lighten(95%),
      inset: (x: 1em, y: 0.8em),
      radius: (right: 4pt),
      breakable: false,
    )
  } else {
    // Regular blockquote.
    std.block(
      body,
      above: 1em,
      inset: (left: 1em),
      stroke: (left: 1pt + gray.lighten(50%)),
    )
  }
}
