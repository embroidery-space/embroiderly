export type ShortcutHandler = () => void;

export interface ShortcutConfig {
  handler: ShortcutHandler;
  /** Allow this shortcut to fire even when an input element is focused. Can be `true` or a specific tag name. */
  usingInput?: boolean | string;
}

export type ShortcutValue = ShortcutHandler | ShortcutConfig;

export interface ShortcutsPluginOptions {
  /** Timeout in milliseconds for sequence chains. @default 500 */
  chainDelay?: number;
  /** HTML tags to ignore when processing shortcuts. @default ["INPUT", "TEXTAREA", "SELECT"] */
  excludeTags?: string[];
}
