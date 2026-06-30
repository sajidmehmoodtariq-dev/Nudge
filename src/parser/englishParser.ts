import * as chrono from 'chrono-node';

import type {ParseResult} from './types';

/**
 * Parses English natural language date/time strings.
 * Wraps chrono-node. Synchronous, must return under 20ms.
 */
export function parseEnglish(text: string, referenceDate?: Date): ParseResult {
  const refDate = referenceDate ?? new Date();

  // Parse with chrono, using forwardDate: true to assume future times
  const results = chrono.parse(text, refDate, {forwardDate: true});

  if (results.length === 0) {
    return {
      datetime: null,
      label: text.trim(),
      confidence: 'none',
      originalText: text,
      language: 'ENGLISH',
    };
  }

  const match = results[0];
  const date = match.start.date();

  // If no time was specified, default to 9:00 AM
  if (!match.start.isCertain('hour')) {
    date.setHours(9, 0, 0, 0);
  }

  // Extract label by removing the matched time expression
  // Replace the first occurrence of the matched text with empty string and clean up spaces
  const label = text.replace(match.text, '').replace(/\s+/g, ' ').trim();

  // Determine confidence based on whether it's a known vs implied match
  const isCertain = match.start.isCertain('hour') || match.start.isCertain('day');
  const confidence = isCertain ? 'high' : 'low';

  return {
    datetime: date,
    label,
    confidence,
    originalText: text,
    language: 'ENGLISH',
  };
}
