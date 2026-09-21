import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Brand } from '@/components/Brand';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { colors, radii, spacing } from '@/theme';

export default function IndexScreen() {
  return (
    <Screen contentContainerStyle={styles.content}>
      <Brand />

      <View style={styles.intro}>
        <View style={styles.badge}>
          <AppText variant="caption" tone="primary">PROTÓTIPO MOBILE</AppText>
        </View>
        <AppText variant="title" accessibilityRole="header">
          Clareza para cuidar do seu dinheiro.
        </AppText>
        <AppText tone="secondary">
          Mais organização no presente. Mais tranquilidade para o futuro.
        </AppText>
      </View>

      <Card>
        <AppText variant="heading" accessibilityRole="header">Tudo em um só lugar</AppText>
        <AppText tone="secondary">
          Receitas, despesas e planejamento com a simplicidade que sua rotina precisa.
        </AppText>
        <View style={styles.divider} />
        <AppText variant="caption" tone="secondary">
          Esta é a apresentação visual do aplicativo. As funcionalidades serão adicionadas nas próximas etapas.
        </AppText>
      </Card>

      <AppText variant="caption" tone="secondary" style={styles.footer}>
        Meus Custos · Seu controle financeiro pessoal
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xxl, gap: spacing.xxl },
  intro: { gap: spacing.lg, paddingTop: spacing.xl },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  footer: { marginTop: 'auto', paddingTop: spacing.xl },
});
