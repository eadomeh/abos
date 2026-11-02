type SegmenterLike = { segment(input: string): Iterable<{ segment: string }> };
type SegmenterCtor = new (
  locales?: string | string[],
  options?: { granularity: 'grapheme' },
) => SegmenterLike;

const LETTER_OR_DIGIT = /[\p{L}\p{N}]/u;

/** Splits text into user-perceived characters (emoji, accents and flags stay whole). */
function graphemes(text: string): string[] {
  const Ctor = (Intl as unknown as { Segmenter?: SegmenterCtor }).Segmenter;
  if (Ctor) {
    return Array.from(new Ctor(undefined, { granularity: 'grapheme' }).segment(text), (part) => part.segment);
  }
  return Array.from(text);
}

/**
 * One-character avatar label for a name.
 * Never splits an emoji or an accented letter; skips leading emoji/symbols and uses the
 * first letter or digit instead. Falls back when the name has none.
 */
export function getInitial(name: string | null | undefined, fallback = '?'): string {
  const text = String(name ?? '').trim();
  if (!text) return fallback;
  for (const grapheme of graphemes(text)) {
    if (LETTER_OR_DIGIT.test(grapheme)) return grapheme.toLocaleUpperCase();
  }
  return fallback;
}
