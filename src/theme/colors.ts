export const colors = {
  primary: '#6366F1', // Vibrant Indigo
  primaryDark: '#4338CA',
  primaryLight: '#818CF8', // Glowing Indigo
  accent: '#10B981', // Neon Mint
  warning: '#F59E0B', // Amber
  danger: '#EF4444', // Rose
  background: '#0B0C10', // Deep OLED Black
  surface: '#1F2833', // Elevated Charcoal
  textMain: '#F9FAFB', // Near-white main text
  textSub: '#9CA3AF', // Cool gray secondary text
  textLight: '#6B7280', // Placeholder, captions
  border: '#2A2C30', // Subtle outline stroke
} as const;

export type ColorKey = keyof typeof colors;
