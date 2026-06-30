// Stub — full implementation in Phase 1 Step 5
import {parseEnglish} from './englishParser';
import {ROMAN_URDU_MAP} from './romanUrduMap';
import type {ParseResult} from './types';

/**
 * Normalises Roman Urdu tokens → English, then feeds into englishParser (which uses chrono).
 * Synchronous, must return under 20ms.
 */
export function parseRomanUrdu(text: string, referenceDate?: Date): ParseResult {
  // Normalise: replace each Roman Urdu token with its English equivalent
  // We use regex to match word boundaries so we don't accidentally replace parts of words
  const tokens = text.split(/\s+/);
  const normalised = tokens
    .map(t => {
      // Strip punctuation for matching, but keep it in the final string if it doesn't match
      const cleanT = t.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const mapped = ROMAN_URDU_MAP[cleanT];
      return mapped ? t.replace(new RegExp(cleanT, 'i'), mapped) : t;
    })
    .join(' ');

  // Feed `normalised` into English parser
  const result = parseEnglish(normalised, referenceDate);

  // Return the result but strictly mark it as ROMAN_URDU
  return {
    ...result,
    originalText: text,
    language: 'ROMAN_URDU',
  };
}
