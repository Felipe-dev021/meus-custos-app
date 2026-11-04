import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/contexto/AuthContext';
import { useTema } from '@/tema/ContextoTema';

export default function LayoutApp() {
  const { estaAutenticado, carregando } = useAuth();
  const { cores } = useTema();

  if (carregando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: cores.fundo,
        }}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  if (!estaAutenticado) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="perfil" />
      <Stack.Screen name="receitas" />
      <Stack.Screen name="despesas" />
      <Stack.Screen name="novo-lancamento" options={{ presentation: 'modal' }} />
      <Stack.Screen name="dividas" />
      <Stack.Screen name="assistente" />
      <Stack.Screen name="mais" />
    </Stack>
  );
}
