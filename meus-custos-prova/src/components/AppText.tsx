import { Text, type TextProps } from 'react-native';

import { colors, typography } from '@/theme';

type AppTextProps = TextProps & {
  variant?: keyof typeof typography;
  tone?: 'default' | 'secondary' | 'primary' | 'danger';
};

const tones = {
  default: colors.text,
  secondary: colors.textSecondary,
  primary: colors.primary,
  danger: colors.danger,
};

export function AppText({
  variant = 'body',
  tone = 'default',
  style,
  ...props
}: AppTextProps) {
  return <Text {...props} style={[typography[variant], { color: tones[tone] }, style]} />;
}
