/** Checks if a given href is an external link. */
export function isExternalHref(href?: string) {
  return !!href && /^[a-z][a-z0-9+.-]*:/i.test(href);
}

/** Returns the appropriate `rel` attribute for a link, based on its href. */
export function getLinkRel(item: { href?: string; rel?: string }) {
  if (item.rel) return item.rel;
  if (isExternalHref(item.href)) return "noopener noreferrer";
  return undefined;
}
