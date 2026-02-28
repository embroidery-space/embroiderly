/**
 * The scrollbar visibility type:
 * - `auto` - means that scrollbars are visible when content is overflowing on the corresponding orientation.
 * - `always` - means that scrollbars are always visible regardless of whether the content is overflowing.
 * - `scroll` - means that scrollbars are visible when the user is scrolling along its corresponding orientation.
 * - `hover` - means that scrollbars are visible when the user is scrolling along its corresponding orientation and when the user is hovering over the scroll area.
 * - `glimpse` - means that scrollbars are briefly shown when the user enters the scroll area, then hidden until further interaction.
 */
export type ScrollType = "auto" | "always" | "scroll" | "hover" | "glimpse";
