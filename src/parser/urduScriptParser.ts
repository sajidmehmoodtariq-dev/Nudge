// Stub — full implementation in Phase 1 Step 5
import {parseEnglish} from './englishParser';
import type {ParseResult} from './types';
import {URDU_SCRIPT_MAP} from './urduScriptMap';

/**
 * Normalises Urdu script tokens → English, then feeds into chrono-node via englishParser.
 * Synchronous, must return under 20ms.
 */
export function parseUrduScript(text: string, referenceDate?: Date): ParseResult {
  // Normalise: replace each Urdu script token with its English equivalent
  // Note: Urdu script words don't always use standard spaces, but we split by space for simplicity
  const tokens = text.split(/\s+/);
  const normalised = tokens
    .map(t => {
      // Strip punctuation to find map match, but keep it if not mapped
      const cleanT = t.replace(/[۔،؛؟!"'()[\]{}]/g, '');
      const mapped = URDU_SCRIPT_MAP[cleanT];
      return mapped ? t.replace(cleanT, mapped) : t;
    })
    .join(' ');

  // Feed `normalised` into English parser
  const result = parseEnglish(normalised, referenceDate);

  return {
    ...result,
    originalText: text,
    language: 'URDU_SCRIPT',
  };
}
