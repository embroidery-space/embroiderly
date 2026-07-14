---
name: embroiderly-docs
description: Use when writing, editing, or restructuring a guide, reference page, or any content under the `docs/` directory.
---

Your task is to write a new guide or update an existing one (exclusively in English).
You may explore the codebase to understand the feature you are documenting.
To resolve UI label text from translation keys like `$t("edit-palette")`, read `app/src/assets/locales/en.ftl`.

- **Target audience:** Professional designers familiar with similar applications, and casual hobbyists.
- **Tone:** Friendly, accessible, and clear.

## Architecture

- **VitePress config:** `docs/.vitepress/config.ts`.
  Locale-specific config (mainly, the navigation) is in `docs/.vitepress/locales/en.ts`.
- **English content:** `docs/en/` — work only here.
- **Assets:** `docs/public/` — images must use absolute paths mirroring the content path.
  Content at `en/guide/filename.md` → images at `/images/guide/filename/<image>.jpg`.

## Formatting Rules (non-negotiable)

These are constraints for our custom VitePress build.
Violating them breaks the build or renders incorrectly.

**Prohibited:**

- Custom anchors, `[[toc]]`, markdown file inclusions (`@include`).
- Code groups, custom containers, VitePress-specific plugins.
- Triple-backtick code blocks — use **inline code** only.
- Standard Markdown images (`![alt](src)`) and standalone `<img>` tags.

**Required:**

- Every page starts with YAML frontmatter containing `description`:

  ```md
  ---
  description: {Concise SEO-optimized description}.
  ---
  ```

- For images, use only `<figure>` + `<img>` + `<figcaption>`:

  ```md
  <figure>
    <img src="/images/guide/filename/example.jpg" />
    <figcaption>Image description.</figcaption>
  </figure>
  ```

- GitHub-flavored admonitions (alerts) and standard HTML are allowed when necessary.

## Style

**Voice and structure:**

- Active voice: use "Click **Save** button", not "The button should be clicked."
- Always use contractions (I'm, don't) unless emphasizing ("it _does_ have").
- Address the user as "you" directly.
- Place each sentence on its own line.
- No AI filler words: no "delve", "comprehensive", "unlock the potential."
- Bold UI elements exactly as they appear: **File → Export → PDF**.

**Correctness:**

- Present tense for guides.
- Flawless subject-verb agreement, logical transitions between paragraphs.
- Never substitute synonyms for technical terms once defined.

**Vocabulary gotchas:**

- Refer to other documentation pages as "chapters", not "guides" or "pages" — the is docs shipped as both a website and a PDF.
- Refer to users' work as "patterns", not "designs".

## Typography

VitePress converts these automatically — write them as-is:

| Write    | Renders as            |
| -------- | --------------------- |
| `"text"` | "text" (curly quotes) |
| `-`      | hyphen                |
| `--`     | en-dash               |
| `---`    | em-dash               |
| `...`    | ellipsis              |
