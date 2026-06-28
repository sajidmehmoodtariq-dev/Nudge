/**
 * parseReminder — orchestrator, single export.
 * Detects language, delegates to the correct parser.
 * Synchronous, must return under 20ms, no async/network.
 */
import {detectLanguage} from './detectLanguage';
import {parseEnglish} from './englishParser';
import {parseRomanUrdu} from './romanUrduParser';
import {parseUrduScript} from './urduScriptParser';

export type {ParseResult} from './types';
export {detectLanguage};

export function parseReminder(text: string, referenceDate?: Date) {
  const language = detectLanguage(text);

  switch (language) {
    case 'URDU_SCRIPT':
      return parseUrduScript(text, referenceDate);
    case 'ROMAN_URDU':
      return parseRomanUrdu(text, referenceDate);
    case 'ENGLISH':
    default:
      return parseEnglish(text, referenceDate);
  }
}
