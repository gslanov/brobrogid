// BROBROGID — Bento design tokens (ported from prototype design-system)
export const C = {
  bg: '#F5F5F4',
  card: '#FFFFFF',
  surface2: '#ECECEA',
  ink: '#0A0A0A',
  ink2: '#262626',
  muted: '#6B7280',
  soft: '#A1A1AA',
  border: '#E5E5E5',
  borderStrong: '#D4D4D4',
  accent: '#DC2626',
  accentDark: '#B91C1C',
  accentSoft: '#FEE2E2',
  accentLight: '#FCA5A5',
  warn: '#F59E0B',
  ok: '#10B981',
  // cinematic (category) dark
  dark: '#0B0B0D',
} as const;

export const R = { card: 24, sm: 16, tile: 18, pill: 999 } as const;

// Manrope weight → loaded font family name (see @expo-google-fonts/manrope)
export const F = {
  r: 'Manrope_400Regular',
  m: 'Manrope_500Medium',
  sb: 'Manrope_600SemiBold',
  b: 'Manrope_700Bold',
  xb: 'Manrope_800ExtraBold',
} as const;
