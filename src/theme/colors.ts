export const colors = {
  primary: '#5B5FEF', // Indigo — bubble, buttons, active states
  primaryDark: '#3D40C4',
  primaryLight: '#E8E9FD', // light indigo — backgrounds, badges
  accent: '#00C896', // Mint green — success, done state, bullets
  warning: '#F59E0B', // Amber — low confidence parse, caution
  danger: '#F43F5E', // Rose — delete, error
  background: '#F7F8FF', // Off-white app background
  surface: '#FFFFFF', // Card / panel surface
  textMain: '#1A1B2E', // Near-black main text
  textSub: '#6B7280', // Cool gray secondary text
  textLight: '#9CA3AF', // Placeholder, captions
  border: '#E5E7EB', // Card borders, dividers
} as const;

export type ColorKey = keyof typeof colors;
