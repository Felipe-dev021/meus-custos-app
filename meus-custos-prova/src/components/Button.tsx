import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, radii, spacing } from '@/theme';

type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  accessibilityState,
  ...props
}: ButtonProps) {
  const unavailable = disabled || loading;
  const foreground = variant === 'primary' ? colors.onPrimary : colors.text;

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? title}
      accessibilityState={{ ...accessibilityState, disabled: unavailable, busy: loading }}
      disabled={unavailable}
      style={(state) => [
        styles.button,
        styles[variant],
        state.pressed && (variant === 'primary' ? styles.primaryPressed : styles.secondaryPressed),
        unavailable && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}>
      {loading && <ActivityIndicator color={foreground} />}
      <AppText variant="label" style={[styles.label, { color: foreground }]}>
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderColor: colors.border },
  primaryPressed: { backgroundColor: colors.primaryPressed },
  secondaryPressed: { backgroundColor: colors.surfaceRaised },
  disabled: { opacity: 0.5 },
  label: { textAlign: 'center', flexShrink: 1 },
});
