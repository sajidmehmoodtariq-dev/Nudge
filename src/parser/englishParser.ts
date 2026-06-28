// Stub — full implementation in Phase 1 Step 5
// Depends on: chrono-node (to be installed)
import type {ParseResult} from './types';

/**
 * Parses English natural language date/time strings.
 * Wraps chrono-node. Synchronous, must return under 20ms.
 */
export function parseEnglish(text: string, _referenceDate?: Date): ParseResult {
  // TODO: implement with chrono-node in Phase 1 Step 5
  // const results = chrono.parse(text, _referenceDate ?? new Date());

  return {
    datetime: null,
    label: text,
    confidence: 'none',
    originalText: text,
    language: 'ENGLISH',
  };
}
