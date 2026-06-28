---
description: A complete reference of keyboard shortcuts available in Embroiderly.
---

# Shortcuts

This chapter provides a complete reference of all keyboard shortcuts available in Embroiderly.

## Shortcuts Definition

Embroiderly supports two types of keyboard shortcuts: _key combinations_ and _key sequences_.

### Key Combinations

_Key combinations_ are shortcuts that require you to press multiple keys simultaneously.
They always include at least one modifier key (`Alt`, `Ctrl`, `Shift`, or `Meta`) along with a regular key.
The keys are shown with a plus sign (`+`) between them.

**Examples:**

- `Ctrl+Z` - Press and hold `Ctrl`, then press `Z`.
- `Ctrl++` - Press and hold `Ctrl`, then press the plus key.
- `Ctrl+Shift+S` - Press and hold `Ctrl` and `Shift`, then press `S`.

Key combinations are executed immediately when all keys are pressed together.

### Key Sequences

_Key sequences_ are shortcuts that require you to press keys one after another in a specific order.
They don't use modifier keys---just regular keys pressed sequentially.
The keys are shown with a minus sign (`-`) between them.

**Examples:**

- `F` - Press `F`.
- `S-S` - Press `S` twice.
- `P-T-L` - Press `P`, then `T`, then `L`.

You have 500 milliseconds between each keypress in a sequence.
If you wait longer, the sequence resets and you'll need to start over.

> [!NOTE]
> Key sequences won't work if you're holding down any modifier keys.
> If you press a modifier key during a sequence, the sequence will be cancelled.

## Application

- `Ctrl+,` - Open application settings.

## Layout

- `Ctrl+Shift+L` - Toggle the palette panel on the left.
- `Ctrl+Shift+R` - Toggle the canvas panel on the right.

## File Operations

- `Ctrl+N` - Create a new pattern.
- `Ctrl+O` - Open an existing pattern.
- `Ctrl+S` - Save the current pattern.
- `Ctrl+Shift+S` - Save the current pattern with a new name or location.
- `Ctrl+W` - Close the current pattern.
- `Ctrl+Q` - Close the application (available only on desktop).

## Navigation

- `Ctrl+1`, ..., `Ctrl+9` - Switch to the corresponding pattern.
- `Ctrl+Home` - Switch to the first pattern.
- `Ctrl+End` - Switch to the last pattern.

## Canvas & View

**Canvas scale:**

- `Ctrl++` - Zoom in.
- `Ctrl+-` - Zoom out.
- `Ctrl+0` - Fit the pattern to the viewport.

**Pattern display:**

- `Shift+V` + `M` - Enable mixed view.
- `Shift+V` + `S` - Enable solid view.
- `Shift+V` + `X` - Enable stitches view.

**Other elements:**

- `Shift+S` - Toggle stitch symbols.
- `Shift+G` - Toggle grid.
- `Shift+R` - Toggle rulers.

## Stitches & Tools

### Full Stitch

- `F` - Full Stitch

### Petite Stitch

- `P` - Petite Stitch (dynamic positioning).
- `P-T-L` - Top Left Petite.
- `P-T-R` - Top Right Petite.
- `P-B-R` - Bottom Right Petite.
- `P-B-L` - Bottom Left Petite.

> [!TIP]
> You can use shorter sequences `P-T` and `P-B` for Top Left Petite and Bottom Left Petite respectively.

### Half Stitch

- `H` - Half Stitch (dynamic positioning).
- `H-F` - Forward Half Stitch.
- `H-B` - Backward Half Stitch.

### Quarter Stitch

- `Q` - Quarter Stitch (dynamic positioning).
- `Q-T-L` - Top Left Quarter.
- `Q-T-R` - Top Right Quarter.
- `Q-B-R` - Bottom Right Quarter.
- `Q-B-L` - Bottom Left Quarter.

> [!TIP]
> You can use shorter sequences `Q-T` and `Q-B` for Top Left Quarter and Bottom Left Quarter respectively.

### Line Stitches

- `S` - Back Stitch.
- `S-S` - Straight Stitch.

### Node Stitches

- `K` - French Knot.
- `J` - Bead.

### Other Tools

- `E` - Eraser.
- `C` - Cursor (selection tool).

## Editing & History

- `Ctrl+Z` - Undo the last action.
- `Ctrl+Y` - Redo the previously undone action.
- `Ctrl+Shift+Z` - Undo a single action from the history.
- `Ctrl+Shift+Y` - Redo a single action from the history.

> [!TIP]
> If you have drawn multiple stitches within a single move, `Ctrl+Z` will undo _all_ those stitches, while `Ctrl+Shift+Z` will undo them _one by one_.
> The same is applied to `Ctrl+Y` and `Ctrl+Shift+Y`.
