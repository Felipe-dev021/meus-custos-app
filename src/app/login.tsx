import { StyleSheet, View } from 'react-native';

import { Texto } from '@/componentes/Texto';
import { Marca } from '@/componentes/Marca';
import { Cartao } from '@/componentes/Cartao';
import { Tela } from '@/componentes/Tela';
import { Botao } from '@/componentes/Botao';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { cores, raios, espacamentos } from '@/tema';

export default function TelaLogin() {
  const { executar } = useFinanceiro();
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
          Explore a demonstração com dados fictícios. Sem cadastro ou conexão com bancos.
        </Texto>
      </Cartao>

      <Botao titulo="Entrar na demonstração" onPress={() => executar({ tipo: 'entrar-demonstracao' })} />

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
