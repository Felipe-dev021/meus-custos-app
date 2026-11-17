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
            <Ionicons
              name="home-outline"
              size={size ?? 22}
              color={typeof color === 'string' ? color : undefined}
            />
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
            <Ionicons
              name="person-outline"
              size={size ?? 22}
              color={typeof color === 'string' ? color : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="[id]"
        options={{
          tabBarItemStyle: { display: 'none' },
          title: 'Detalhes do Lançamento',
        }}
      />
      <Tabs.Screen
        name="receitas"
        options={{
          tabBarItemStyle: { display: 'none' },
          title: 'Receitas',
        }}
      />
      <Tabs.Screen
        name="despesas"
        options={{
          tabBarItemStyle: { display: 'none' },
          title: 'Despesas',
        }}
      />
      <Tabs.Screen
        name="novo-lancamento"
        options={{
          tabBarItemStyle: { display: 'none' },
          title: 'Novo Lançamento',
        }}
      />
      <Tabs.Screen
        name="dividas"
        options={{
          tabBarItemStyle: { display: 'none' },
          title: 'Dívidas',
        }}
      />
      <Tabs.Screen
        name="assistente"
        options={{
          tabBarItemStyle: { display: 'none' },
          title: 'Assistente',
        }}
      />
      <Tabs.Screen
        name="cotacoes"
        options={{
          tabBarItemStyle: { display: 'none' },
          title: 'Cotações',
        }}
      />
      <Tabs.Screen
        name="relatorios"
        options={{
          tabBarItemStyle: { display: 'none' },
          title: 'Relatórios',
        }}
      />
      <Tabs.Screen
        name="categorias"
        options={{
          tabBarItemStyle: { display: 'none' },
          title: 'Categorias & Metas',
        }}
      />
      <Tabs.Screen
        name="mais"
        options={{
          tabBarItemStyle: { display: 'none' },
          title: 'Mais',
        }}
      />
    </Tabs>
  );
}
