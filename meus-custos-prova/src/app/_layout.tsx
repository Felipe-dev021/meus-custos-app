import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { cores } from '@/tema';
import { ProvedorFinanceiro } from '@/estado/ContextoFinanceiro';

const temaNavegacao = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: cores.primaria,
    background: cores.fundo,
    card: cores.superficie,
    text: cores.texto,
    border: cores.borda,
    notification: cores.perigo,
  },
};

export default function LayoutRaiz() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={temaNavegacao}>
        <StatusBar style="light" />
        <ProvedorFinanceiro>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }} />
        </ProvedorFinanceiro>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
