# Editor Crate

This crate provides the core editing engine for Embroiderly.
It is runtime-agnostic — it has no dependency on Wasm, Tauri, or any I/O.
The Wasm module wraps it to expose editing functionality to the frontend.

## `Editor`

This struct owns all open pattern projects and their edit histories, keyed by UUID.
It is the single entry point for all editing operations.

Callers interact with the editor through the `dispatch()` methods, which applies an `EditorAction` to a target pattern project and returns the resulting `EditorEvent`s.
The action is then recorded in the pattern's history for future undo/redo.

## Actions

`EditorAction` is an enum whose variants cover all editing operations grouped by domain.
Each action implements two methods:

- `perform()` — applies the action to a pattern project and returns the events that describe the change.
- `revoke()` — reverses the action and returns the corresponding events.

## Events

`EditorEvent` is an enum that describes every kind of change the editor can produce.
Each variant carries the minimal data the frontend needs to update its state.

## History

This struct maintains undo and redo stacks for a single pattern project.
Both stacks hold three kinds of entries:

- **Single actions** are independent operations pushed one at a time.
- **Transactions** group multiple actions into one logical unit.
  A transaction is opened with the `start_transaction()` method, accumulates actions while active, and is committed as a single entry by the `end_transaction()` method.
  Undoing a transaction revokes all its actions in reverse order, atomically.
- **Checkpoints** mark save points on the undo stack.
  A pattern is considered to have unsaved changes when the top of the undo stack is **not** a checkpoint.
  Checkpoints are pushed when the pattern is saved; they do not represent an action and cannot be undone on their own.

One important consequence: if the user saves, makes changes, and then undoes past the save point, the pattern is again considered clean because the checkpoint is back at the top.
