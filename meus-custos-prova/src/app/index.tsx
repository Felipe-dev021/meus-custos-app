import { StyleSheet, View } from 'react-native';

import { Texto } from '@/componentes/Texto';
import { Marca } from '@/componentes/Marca';
import { Cartao } from '@/componentes/Cartao';
import { Tela } from '@/componentes/Tela';
import { cores, raios, espacamentos } from '@/tema';

export default function TelaInicial() {
  return (
    <Tela contentContainerStyle={estilos.conteudo}>
      <Marca />

      <View style={estilos.apresentacao}>
        <View style={estilos.selo}>
          <Texto variante="legenda" tom="primaria">PROTÓTIPO MOBILE</Texto>
        </View>
        <Texto variante="titulo" accessibilityRole="header">
          Clareza para cuidar do seu dinheiro.
        </Texto>
        <Texto tom="secundaria">
          Mais organização no presente. Mais tranquilidade para o futuro.
        </Texto>
      </View>

      <Cartao>
        <Texto variante="subtitulo" accessibilityRole="header">Tudo em um só lugar</Texto>
        <Texto tom="secundaria">
          Receitas, despesas e planejamento com a simplicidade que sua rotina precisa.
        </Texto>
        <View style={estilos.divisor} />
        <Texto variante="legenda" tom="secundaria">
          Esta é a apresentação visual do aplicativo. As funcionalidades serão adicionadas nas próximas etapas.
        </Texto>
      </Cartao>

      <Texto variante="legenda" tom="secundaria" style={estilos.rodape}>
        Meus Custos · Seu controle financeiro pessoal
      </Texto>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  conteudo: { paddingTop: espacamentos.amplo, gap: espacamentos.amplo },
  apresentacao: { gap: espacamentos.grande, paddingTop: espacamentos.extraGrande },
  selo: {
    alignSelf: 'flex-start',
    paddingHorizontal: espacamentos.medio,
    paddingVertical: espacamentos.minimo,
    borderRadius: raios.capsula,
    backgroundColor: cores.primariaSuave,
  },
  divisor: { height: 1, backgroundColor: cores.borda, marginVertical: espacamentos.minimo },
  rodape: { marginTop: 'auto', paddingTop: espacamentos.extraGrande },
});
