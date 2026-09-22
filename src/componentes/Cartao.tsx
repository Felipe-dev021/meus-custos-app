import { StyleSheet, View, type ViewProps } from 'react-native';

import { espacamentos, raios } from '@/tema';
import { useTema } from '@/tema/ContextoTema';

export function Cartao({ style, ...propriedades }: ViewProps) {
  const { cores } = useTema();

  return (
    <View
      {...propriedades}
      style={[
        estilos.cartao,
        {
          backgroundColor: cores.superficie,
          borderColor: cores.borda,
        },
        style,
      ]}
    />
  );
}

const estilos = StyleSheet.create({
  cartao: {
    padding: espacamentos.extraGrande,
    gap: espacamentos.medio,
    borderWidth: 1,
    borderRadius: raios.medio,
  },
});
