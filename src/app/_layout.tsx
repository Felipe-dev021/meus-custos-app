import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { cores } from '@/tema';
import { ProvedorFinanceiro, useFinanceiro } from '@/estado/ContextoFinanceiro';

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
          <Navegacao />
        </ProvedorFinanceiro>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function Navegacao() {
  const { demonstracaoAtiva } = useFinanceiro();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!demonstracaoAtiva}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={demonstracaoAtiva}>
        <Stack.Screen name="(principal)" />
        <Stack.Screen name="novo-lancamento" options={{ presentation: 'modal' }} />
        <Stack.Screen name="dividas" />
        <Stack.Screen name="assistente" />
        <Stack.Screen name="perfil" />
      </Stack.Protected>
    </Stack>
  );
}
