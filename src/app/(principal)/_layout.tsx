import { Tabs } from 'expo-router';
import { Text } from 'react-native';

const abas = [
  { nome: 'visao-geral', titulo: 'Visão geral', simbolo: '◫' },
  { nome: 'receitas', titulo: 'Receitas', simbolo: '↗' },
  { nome: 'despesas', titulo: 'Despesas', simbolo: '↙' },
  { nome: 'mais', titulo: 'Mais', simbolo: '•••' },
];

export default function AbasPrincipais() {
  return (
    <Tabs initialRouteName="visao-geral" backBehavior="initialRoute" screenOptions={{
      headerShown: false,
      tabBarStyle: { display: 'none' },
    }}>
      {abas.map((aba) => (
        <Tabs.Screen key={aba.nome} name={aba.nome} options={{
          title: aba.titulo,
          tabBarAccessibilityLabel: aba.titulo,
          tabBarIcon: ({ color }) => <Text accessible={false} style={{ color, fontSize: 24 }}>{aba.simbolo}</Text>,
        }} />
      ))}
    </Tabs>
  );
}
