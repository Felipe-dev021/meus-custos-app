import { Image, StyleSheet, View } from 'react-native';

import { Texto } from '@/componentes/Texto';
import { espacamentos } from '@/tema';

const logoImagem = require('../../assets/logo.png');

export function Marca() {
  return (
    <View accessible accessibilityLabel="Meus Custos" style={estilos.marca}>
      <Image
        source={logoImagem}
        style={estilos.imagemLogo}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="Ícone Meus Custos"
      />
      <Texto tom="primaria" style={estilos.assinatura}>
        {'Meus\nCustos'}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.medio,
    alignSelf: 'flex-start',
    paddingVertical: espacamentos.minimo,
  },
  imagemLogo: {
    width: 44,
    height: 44,
  },
  assinatura: {
    fontSize: 32,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -1,
  },
});
