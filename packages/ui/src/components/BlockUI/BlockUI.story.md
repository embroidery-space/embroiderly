# BlockUI

A component that blocks user interaction with its content.

## Purpose

The `BlockUI` component is used to prevent user interaction with a section of the UI while an operation is in progress.
It displays a semi-transparent overlay over its content and sets `aria-busy` for accessibility.

## When to Use

- Use `BlockUI` to indicate that a section is temporarily unavailable during loading or processing.
- Do not use `BlockUI` for entire page blocking; consider a modal or loading screen instead.
