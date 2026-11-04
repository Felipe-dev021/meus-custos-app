import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
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
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSecundario,
        tabBarStyle: {
          backgroundColor: cores.superficie,
          borderTopColor: cores.borda,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarLabel: 'Início',
          tabBarAccessibilityLabel: 'Aba Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarAccessibilityLabel: 'Aba Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="[id]"
        options={{
          href: null,
          title: 'Detalhes do Lançamento',
        }}
      />
      <Tabs.Screen
        name="receitas"
        options={{
          href: null,
          title: 'Receitas',
        }}
      />
      <Tabs.Screen
        name="despesas"
        options={{
          href: null,
          title: 'Despesas',
        }}
      />
      <Tabs.Screen
        name="novo-lancamento"
        options={{
          href: null,
          title: 'Novo Lançamento',
        }}
      />
      <Tabs.Screen
        name="dividas"
        options={{
          href: null,
          title: 'Dívidas',
        }}
      />
      <Tabs.Screen
        name="assistente"
        options={{
          href: null,
          title: 'Assistente',
        }}
      />
      <Tabs.Screen
        name="mais"
        options={{
          href: null,
          title: 'Mais',
        }}
      />
    </Tabs>
  );
}
