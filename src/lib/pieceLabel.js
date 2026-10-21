// What a row of the word table prints as its label.
//
// A row of the word table is a token id, and the page prints a token the way
// instrument B does: the tokenizer decodes it, a leading space shows as ␣, a
// newline as ⏎ and a tab as ⇥ (realModel.js `displayToken`). That print is
// honest for almost every row and mute for some: the first 256 rows are the
// single raw bytes, and a byte that is not a character on its own decodes to
// the replacement glyph � or to a control character that prints as nothing.
// Longer pieces that hold half of a multi-byte character decode to � too.
//
// The vocabulary itself has a spelling for every one of them — byte-level BPE
// writes each byte as one printable letter (`Ĵ` is the byte 0xF0, `Ġ` the
// space) — so where the print says nothing, the label prints that spelling,
// with its leading `Ġ` shown as ␣ like every other leading space on the page.
//
// One implementation, imported by the instrument for every live label and by
// scripts/read-model-file.mjs for the labels it ships, so a shipped label and
// a live one are the same rule applied to the same two strings.

const REPLACEMENT = 0xfffd

/** True when a printed piece holds the replacement glyph or a control character. */
export function needsSpelling(decoded) {
  for (const ch of decoded) {
    const c = ch.codePointAt(0)
    if (c === REPLACEMENT || c <= 0x1f || (c >= 0x7f && c <= 0x9f)) return true
  }
  return false
}

/** The vocabulary's own spelling as the page prints it: a leading `Ġ` is ␣. */
export function shownSpelling(spelling) {
  return spelling.replace(/^Ġ/, '␣')
}

/**
 * The label for one row: the printed piece, unless that print holds � or a
 * control character, in which case the vocabulary's spelling of it.
 */
export function labelOf(decoded, spelling) {
  return needsSpelling(decoded) ? shownSpelling(spelling) : decoded
}
