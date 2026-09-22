import { StyleSheet, View, type ViewProps } from 'react-native';

import { cores, raios, espacamentos } from '@/tema';

export function Cartao({ style, ...propriedades }: ViewProps) {
  return <View {...propriedades} style={[estilos.cartao, style]} />;
}

const estilos = StyleSheet.create({
  cartao: {
    padding: espacamentos.extraGrande,
    gap: espacamentos.medio,
    backgroundColor: cores.superficie,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: raios.medio,
  },
});
