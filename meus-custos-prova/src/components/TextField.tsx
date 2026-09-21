import { useId, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, radii, spacing, typography } from '@/theme';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
};

export function TextField({
  label,
  error,
  hint,
  style,
  onFocus,
  onBlur,
  editable = true,
  ...props
}: TextFieldProps) {
  const labelId = useId();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <AppText nativeID={labelId} variant="label">{label}</AppText>
      <TextInput
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.primary}
        keyboardAppearance="dark"
        {...props}
        editable={editable}
        accessibilityLabel={props.accessibilityLabel ?? label}
        accessibilityLabelledBy={labelId}
        accessibilityHint={error ?? hint ?? props.accessibilityHint}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          focused && styles.focused,
          !!error && styles.invalid,
          !editable && styles.disabled,
          style,
        ]}
      />
      {(error || hint) && (
        <AppText
          variant="caption"
          tone={error ? 'danger' : 'secondary'}
          accessibilityLiveRegion={error ? 'polite' : 'none'}>
          {error || hint}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  input: {
    ...typography.body,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    color: colors.text,
  },
  focused: { borderColor: colors.primary },
  invalid: { borderColor: colors.danger },
  disabled: { opacity: 0.5 },
});
