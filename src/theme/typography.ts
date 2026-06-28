/**
 * Typography — single source of truth for all text styles.
 * Font files live in android/app/src/main/assets/fonts/
 *
 * Latin/English: Inter (Inter-Regular, Inter-Medium, Inter-SemiBold, Inter-Bold)
 * Urdu script:   NotoNastaliqUrdu-Regular
 *
 * RULE: Never hardcode fontFamily or fontSize outside this file.
 * Import textStyles, fontFamily, or fontSize from '@theme'.
 */
import type {TextStyle} from 'react-native';

// ─── Font Family Tokens ───────────────────────────────────────────────────────

export const fontFamily = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  urdu: 'NotoNastaliqUrdu-Regular',
} as const;

export type FontFamilyKey = keyof typeof fontFamily;

// ─── Font Size Scale (sp) ─────────────────────────────────────────────────────
// Line height is always 1.5× the font size.

export const fontSize = {
  caption: 12, // timestamps, secondary labels
  body: 14, // list items, body copy
  label: 15, // reminder card label (SemiBold)
  input: 16, // TextInput text
  confirmLabel: 20, // ConfirmScreen parsed result (Bold)
  title: 28, // screen titles (Bold)
} as const;

export type FontSizeKey = keyof typeof fontSize;

export const lineHeight = {
  caption: 18, // 12 × 1.5
  body: 21, // 14 × 1.5
  label: 22.5, // 15 × 1.5
  input: 24, // 16 × 1.5
  confirmLabel: 30, // 20 × 1.5
  title: 42, // 28 × 1.5
} as const;

// ─── Composed TextStyle Presets ───────────────────────────────────────────────
// Use these in StyleSheet.create() — they are plain objects, not RN StyleSheet.

export const textStyles = {
  /** Screen titles — 28sp Bold */
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.title,
    lineHeight: lineHeight.title,
  } satisfies TextStyle,

  /** Section headings — 20sp SemiBold */
  heading: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.confirmLabel,
    lineHeight: lineHeight.confirmLabel,
  } satisfies TextStyle,

  /** Reminder card label — 15sp SemiBold */
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.label,
    lineHeight: lineHeight.label,
  } satisfies TextStyle,

  /** Body / list items — 14sp Regular */
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
  } satisfies TextStyle,

  /** Body medium weight — 14sp Medium */
  bodyMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
  } satisfies TextStyle,

  /** TextInput text — 16sp Regular */
  input: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.input,
    lineHeight: lineHeight.input,
  } satisfies TextStyle,

  /** Timestamps, secondary captions — 12sp Regular */
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
  } satisfies TextStyle,

  /** Urdu script body — 14sp NotoNastaliqUrdu, RTL */
  urduBody: {
    fontFamily: fontFamily.urdu,
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
    writingDirection: 'rtl',
  } satisfies TextStyle,

  /** Urdu script label — 15sp NotoNastaliqUrdu, RTL */
  urduLabel: {
    fontFamily: fontFamily.urdu,
    fontSize: fontSize.label,
    lineHeight: lineHeight.label,
    writingDirection: 'rtl',
  } satisfies TextStyle,
} as const;
