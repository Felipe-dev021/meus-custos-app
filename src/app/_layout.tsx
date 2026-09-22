import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ProvedorFinanceiro, useFinanceiro } from '@/estado/ContextoFinanceiro';
import { ProvedorTema, useTema } from '@/tema/ContextoTema';

export default function LayoutRaiz() {
  return (
    <SafeAreaProvider>
      <ProvedorTema>
        <ProvedorFinanceiro>
          <AppComTema />
        </ProvedorFinanceiro>
      </ProvedorTema>
    </SafeAreaProvider>
  );
}

function AppComTema() {
  const { tema, cores } = useTema();

  const temaNavegacao = useMemo(() => {
    const base = tema === 'escuro' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: cores.primaria,
        background: cores.fundo,
        card: cores.superficie,
        text: cores.texto,
        border: cores.borda,
        notification: cores.perigo,
      },
    };
  }, [tema, cores]);

  return (
    <ThemeProvider value={temaNavegacao}>
      <View style={{ flex: 1, backgroundColor: cores.fundo }}>
        <StatusBar
          style={tema === 'escuro' ? 'light' : 'dark'}
        />
        <Navegacao />
      </View>
    </ThemeProvider>
  );
}

function Navegacao() {
  const { demonstracaoAtiva } = useFinanceiro();
  const { cores } = useTema();
  const [reduzirMovimento, setReduzirMovimento] = useState(false);

  useEffect(() => {
    let ativo = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((habilitado) => {
      if (ativo) setReduzirMovimento(habilitado);
    });

    const inscricao = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (habilitado) => {
        if (ativo) setReduzirMovimento(habilitado);
      },
    );

    return () => {
      ativo = false;
      inscricao?.remove();
    };
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: reduzirMovimento ? 'none' : 'fade',
        animationDuration: 180,
        contentStyle: { backgroundColor: cores.fundo },
      }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!demonstracaoAtiva}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={demonstracaoAtiva}>
        <Stack.Screen name="(principal)" />
        <Stack.Screen
          name="novo-lancamento"
          options={{
            presentation: 'modal',
            animation: reduzirMovimento ? 'none' : 'slide_from_bottom',
            animationDuration: 180,
          }}
        />
        <Stack.Screen name="dividas" />
        <Stack.Screen name="assistente" />
        <Stack.Screen name="perfil" />
      </Stack.Protected>
    </Stack>
  );
}
