import type {Language} from './types';

/**
 * Detects whether input text is Urdu script, Roman Urdu, or English.
 * Uses Unicode range check for Arabic/Urdu script characters.
 * Synchronous — must return under 20ms.
 */
export function detectLanguage(text: string): Language {
  // Urdu/Arabic Unicode block: U+0600–U+06FF
  const urduScriptPattern = /[\u0600-\u06FF]/;
  if (urduScriptPattern.test(text)) {
    return 'URDU_SCRIPT';
  }

  // Roman Urdu: check for common Romanised Urdu tokens
  const romanUrduTokens = [
    'kal',
    'aaj',
    'abhi',
    'subah',
    'sham',
    'raat',
    'dopeher',
    'somwar',
    'mangal',
    'budh',
    'jumeraat',
    'jumma',
    'hafta',
    'itwaar',
    'baje',
    'ghante',
    'parso',
    'agli',
    'mein',
  ];
  const lowerText = text.toLowerCase();
  const isRomanUrdu = romanUrduTokens.some(token => lowerText.split(/\s+/).includes(token));

  return isRomanUrdu ? 'ROMAN_URDU' : 'ENGLISH';
}
