export const colors = {
  background: '#000000',
  surface: '#0e0e0f',
  surfaceRaised: '#161617',
  border: '#27272a',
  text: '#fafafa',
  textSecondary: '#a1a1aa',
  primary: '#00ff55',
  primaryPressed: '#05df72',
  primarySoft: 'rgba(0, 255, 85, 0.09)',
  onPrimary: '#001a09',
  danger: '#ff5d62',
  warning: '#f99c00',
  info: '#3080ff',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = { sm: 10, md: 16, pill: 999 } as const;

export const typography = {
  title: { fontSize: 30, lineHeight: 38, fontWeight: '700' },
  heading: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 20, fontWeight: '400' },
  amount: { fontSize: 32, lineHeight: 40, fontWeight: '700' },
} as const;
