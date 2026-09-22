import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Botao } from '@/componentes/Botao';
import { CabecalhoNavegacao } from '@/componentes/CabecalhoNavegacao';
import { Cartao } from '@/componentes/Cartao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import { cores, espacamentos, raios } from '@/tema';

type RotaAtiva = 'visao-geral' | 'receitas' | 'despesas' | 'dividas' | 'assistente' | 'perfil';

type PropriedadesTelaEmBreve = {
  titulo: string;
  rotaAtiva?: RotaAtiva;
  subtitulo?: string;
};

/** Rota para as áreas cuja funcionalidade estará disponível em breve. */
export function TelaEmBreve({
  titulo,
  rotaAtiva,
  subtitulo = 'Esta funcionalidade estará disponível em breve no aplicativo.',
}: PropriedadesTelaEmBreve) {
  const navegador = useRouter();

  return (
    <Tela edges={['top', 'right', 'left']}>
      {/* Topo unificado com Logo e Menu Hambúrguer */}
      <CabecalhoNavegacao rotaAtiva={rotaAtiva} />

      <View style={estilos.cabecalhoSecao}>
        <Texto variante="titulo" accessibilityRole="header">
          {titulo}
        </Texto>
        <Texto tom="secundaria">
          Módulo do sistema Meus Custos
        </Texto>
      </View>

      <Cartao style={estilos.cartaoEmBreve}>
        <View style={estilos.badgeEmBreve}>
          <Texto variante="legenda" tom="primaria" style={estilos.badgeTexto}>
            EM BREVE
          </Texto>
        </View>

        <Texto variante="subtitulo" style={estilos.tituloAviso}>
          Funcionalidade em desenvolvimento
        </Texto>

        <Texto tom="secundaria" style={estilos.descricaoAviso}>
          {subtitulo}
        </Texto>

        <View style={estilos.linhaDivisora} />

        <Botao
          titulo="Ir para Visão geral"
          variante="secundaria"
          onPress={() => navegador.replace('/(principal)/visao-geral')}
        />
      </Cartao>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  cabecalhoSecao: {
    gap: espacamentos.minimo,
    marginBottom: espacamentos.medio,
  },
  cartaoEmBreve: {
    gap: espacamentos.medio,
    padding: espacamentos.grande,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  badgeEmBreve: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: espacamentos.pequeno,
    paddingVertical: espacamentos.minimo / 2,
    borderRadius: raios.pequeno,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  badgeTexto: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tituloAviso: {
    marginTop: espacamentos.minimo,
  },
  descricaoAviso: {
    lineHeight: 20,
  },
  linhaDivisora: {
    height: 1,
    backgroundColor: cores.borda,
    marginVertical: espacamentos.minimo,
  },
});
