---
name: embroiderly-context
description: Use it to load and enforce domain glossary throughout the task.
allowed-tools: Read Write Edit
user-invocable: false
---

## At task start

1. Read `CONTEXT_MAP.md` at the repo root. If it doesn't exist yet, proceed without one and create it lazily when the first term is resolved.
2. Identify which bounded context(s) the current task touches based on the packages involved.
3. Read only the relevant `CONTEXT.md` file(s) --- do not load all contexts upfront.

## During the task

Use only the canonical terms from the loaded glossary in all code, variable names, comments, documentation, and output.

When the user uses a term that conflicts with the glossary, surface it before proceeding: "Your glossary defines X as Y --- did you mean Z?"

When the user uses a vague or overloaded term not yet in the glossary, propose a precise canonical term rather than silently adopting their phrasing.

When a term is resolved --- whether clarified from vagueness or introduced for the first time --- update the relevant `CONTEXT.md` immediately.
Do not batch updates.

## Creating files

Create `CONTEXT.md` and `CONTEXT_MAP.md` lazily --- only when the first term is resolved, not speculatively.
Never create empty placeholder files.

## `CONTEXT.md` template

```md
# {Context Name}

{One or two sentences: what this context is and why it exists}.

## Language

**{Term}**:
{One or two sentences: what it IS, not what it does}.
_Avoid_: {synonym}, {synonym}.
```

**Rules**:

- One or two sentences per definition. Define what a term IS, not what it does.
- List rejected synonyms under `_Avoid_`.
- If there are no rejected synonyms, omit `_Avoid_`.
- Domain terms only --- not general programming concepts.
- No implementation details, architectural decisions, or anything that reads like a spec. Glossary only.
- Group under subheadings when natural clusters emerge.

## `CONTEXT_MAP.md` template

```md
# Context Map

## Contexts

- [{Name}](./{path}/CONTEXT.md) --- {one sentence: what this context owns}.

## Relationships

- **{Context A} -> {Context B}**: {how they relate --- events emitted/consumed, shared types, HTTP calls, etc.}.
```
