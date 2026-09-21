import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { spacing } from '@/theme';

export function Brand() {
  return (
    <View accessible accessibilityLabel="Meus Custos" style={styles.brand}>
      <AppText tone="primary" style={styles.wordmark}>{'meus\ncustos'}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { alignSelf: 'flex-start', paddingVertical: spacing.xs },
  wordmark: { fontSize: 34, lineHeight: 32, fontWeight: '800', letterSpacing: -1.5 },
});
