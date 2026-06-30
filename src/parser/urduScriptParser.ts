// Stub — full implementation in Phase 1 Step 5
import type {ParseResult} from './types';
import {URDU_SCRIPT_MAP} from './urduScriptMap';

/**
 * Normalises Urdu script tokens → English, then feeds into chrono-node.
 * Synchronous, must return under 20ms.
 */
export function parseUrduScript(text: string, _referenceDate?: Date): ParseResult {
  // Normalise: replace each Urdu script token with its English equivalent
  const tokens = text.split(/\s+/);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _normalised = tokens.map(t => URDU_SCRIPT_MAP[t] ?? t).join(' ');

  // TODO: feed `normalised` into chrono-node in Phase 1 Step 5
  // void normalised;
  // void referenceDate;

  return {
    datetime: null,
    label: text,
    confidence: 'none',
    originalText: text,
    language: 'URDU_SCRIPT',
  };
}
