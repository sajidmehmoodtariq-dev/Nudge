// Stub — full implementation in Phase 1 Step 5
import type {ParseResult} from './types';
import {URDU_SCRIPT_MAP} from './urduScriptMap';

/**
 * Normalises Urdu script tokens → English, then feeds into chrono-node.
 * Synchronous, must return under 20ms.
 */
export function parseUrduScript(text: string, referenceDate?: Date): ParseResult {
  // Normalise: replace each Urdu token with its English equivalent
  const tokens = text.split(/\s+/);
  const normalised = tokens.map(t => URDU_SCRIPT_MAP[t] ?? t).join(' ');

  // TODO: feed `normalised` into chrono-node in Phase 1 Step 5
  void normalised;
  void referenceDate;

  return {
    datetime: null,
    label: text,
    confidence: 'none',
    originalText: text,
    language: 'URDU_SCRIPT',
  };
}
