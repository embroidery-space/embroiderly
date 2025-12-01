export function getMouseButtons(event: PointerEvent | MouseEvent): MouseButtons {
  const { button, buttons } = event;
  if (button === -1) {
    return { left: (buttons & 1) !== 0, middle: (buttons & 4) !== 0, right: (buttons & 2) !== 0 };
  } else {
    return { left: button === 0, middle: button === 1, right: button === 2 };
  }
}

export interface MouseButtons {
  left: boolean;
  middle: boolean;
  right: boolean;
}
