import { Stack } from 'expo-router';

export default function LayoutApp() {
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
