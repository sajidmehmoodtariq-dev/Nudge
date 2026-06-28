// Parser output schema — every parser must return this exact shape
export interface ParseResult {
  datetime: Date | null;
  label: string; // reminder text minus the time expression
  confidence: 'high' | 'low' | 'none';
  originalText: string;
  language: 'ENGLISH' | 'ROMAN_URDU' | 'URDU_SCRIPT';
}

export type Language = ParseResult['language'];
