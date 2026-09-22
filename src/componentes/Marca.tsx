import { StyleSheet, View } from 'react-native';

import { Texto } from '@/componentes/Texto';
import { espacamentos } from '@/tema';

export function Marca() {
  return (
    <View accessible accessibilityLabel="Meus Custos" style={estilos.marca}>
      <Texto tom="primaria" style={estilos.assinatura}>{'meus\ncustos'}</Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  marca: { alignSelf: 'flex-start', paddingVertical: espacamentos.minimo },
  assinatura: { fontSize: 34, lineHeight: 32, fontWeight: '800', letterSpacing: -1.5 },
});
