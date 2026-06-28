// Stub — full implementation in Phase 1 Step 5
import {ROMAN_URDU_MAP} from './romanUrduMap';
import type {ParseResult} from './types';

/**
 * Normalises Roman Urdu tokens → English, then feeds into chrono-node.
 * Synchronous, must return under 20ms.
 */
export function parseRomanUrdu(text: string, referenceDate?: Date): ParseResult {
  // Normalise: replace each Roman Urdu token with its English equivalent
  const tokens = text.split(/\s+/);
  const normalised = tokens.map(t => ROMAN_URDU_MAP[t.toLowerCase()] ?? t).join(' ');

  // TODO: feed `normalised` into chrono-node in Phase 1 Step 5
  void normalised;
  void referenceDate;

  return {
    datetime: null,
    label: text,
    confidence: 'none',
    originalText: text,
    language: 'ROMAN_URDU',
  };
}
