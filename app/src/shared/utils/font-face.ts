/**
 * Adds symbol font(s) to the document's font face set.
 * @param fontFaces - Single FontFace or array of FontFaces to add.
 */
export function addSymbolFonts(fontFaces: FontFace | FontFace[]) {
  const faces = Array.isArray(fontFaces) ? fontFaces : [fontFaces];
  for (const fontFace of faces) {
    document.fonts.add(fontFace);
  }
}

/**
 * Removes symbol font(s) from the document's font face set.
 * @param fontFamilies - Single font family name or array of names to remove.
 */
export function removeSymbolFonts(fontFamilies: string | string[]) {
  const familiesSet = new Set(Array.isArray(fontFamilies) ? fontFamilies : [fontFamilies]);
  for (const fontFace of document.fonts) {
    if (familiesSet.has(fontFace.family)) {
      document.fonts.delete(fontFace);
    }
  }
}

/**
 * Clears all symbol fonts from the document's font face set except the specified ones.
 * @param keepFamilies - Font families to keep.
 */
export function clearSymbolFonts(keepFamilies: string[] = []) {
  const keepSet = new Set(keepFamilies);
  for (const fontFace of document.fonts) {
    if (!keepSet.has(fontFace.family)) {
      document.fonts.delete(fontFace);
    }
  }
}
