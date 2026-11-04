import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Botao } from '@/componentes/Botao';
import { Cartao } from '@/componentes/Cartao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import { categoriasDespesa, categoriasReceita } from '@/dominio/categorias';
import type { Despesa, Lancamento } from '@/dominio/financeiro';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { espacamentos, raios } from '@/tema';
import { useTema } from '@/tema/ContextoTema';
import { formatarData, formatarMoeda, paraDataCivil } from '@/utilitarios/formatacao';

export default function TelaDetalheLancamento() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { dados, executar } = useFinanceiro();
  const { cores } = useTema();

  const item: Lancamento | undefined = dados.lancamentos.find((l) => l.id === id);

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  if (!item) {
    return (
      <Tela edges={['top', 'bottom', 'left', 'right']} contentContainerStyle={estilos.conteudoCentralizado}>
        <Cartao style={estilos.cartaoNaoEncontrado}>
          <View style={[estilos.iconeVazio, { backgroundColor: cores.superficieElevada }]}>
            <Ionicons name="search-outline" size={32} color={cores.textoMutado} />
          </View>
          <Texto variante="titulo" accessibilityRole="header">
            Lançamento não encontrado
          </Texto>
          <Texto tom="secundaria" style={estilos.textoNaoEncontrado}>
            O item com identificador "{id}" não foi localizado ou pode ter sido removido.
          </Texto>
          <Botao
            titulo="Voltar para Início"
            variante="primaria"
            onPress={voltar}
            style={estilos.botaoVoltarErro}
          />
        </Cartao>
      </Tela>
    );
  }

  const ehReceita = item.tipo === 'receita';
  const estaPaga = ehReceita || item.situacao === 'paga';
  const nomeCategoria = ehReceita
    ? categoriasReceita[item.categoria] ?? item.categoria
    : categoriasDespesa[item.categoria] ?? item.categoria;

  function alternarSituacaoDespesa() {
    if (!item || item.tipo === 'receita') return;
    const despesa = item as Despesa;
    const hoje = paraDataCivil(new Date());

    if (despesa.situacao === 'pendente') {
      executar({
        tipo: 'pagar-despesa',
        id: despesa.id,
        dataPagamento: hoje,
        hoje,
      });
      Alert.alert('Sucesso', 'Despesa marcada como paga.');
    } else {
      if (despesa.origem.tipo === 'parcela') {
        Alert.alert(
          'Parcela vinculada',
          'Esta despesa provém de uma parcela quitada no módulo de Dívidas.',
        );
        return;
      }
      executar({
        tipo: 'reverter-pagamento-despesa',
        id: despesa.id,
      });
      Alert.alert('Sucesso', 'Pagamento revertido para pendente.');
    }
  }

  return (
    <Tela edges={['top', 'left', 'right']}>
      {/* Botão de retorno e cabeçalho */}
      <View style={estilos.cabecalhoTopo}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={voltar}
          style={estilos.botaoRetorno}>
          <Ionicons name="arrow-back-outline" size={18} color={cores.primaria} />
          <Texto variante="rotulo" tom="primaria">
            Voltar
          </Texto>
        </Pressable>

        <Texto variante="titulo" accessibilityRole="header">
          Detalhes do Lançamento
        </Texto>
        <Texto tom="secundaria">
          Informações completas sobre esta movimentação financeira.
        </Texto>
      </View>

      {/* Cartão de Destaque com Valor e Tipo */}
      <Cartao
        style={[
          estilos.cartaoDestaque,
          {
            backgroundColor: cores.cartaoMetrica,
            borderColor: cores.borda,
          },
        ]}>
        <View style={estilos.linhaSelo}>
          <View
            style={[
              estilos.seloTipo,
              {
                backgroundColor: ehReceita ? 'rgba(0, 255, 85, 0.12)' : 'rgba(255, 68, 68, 0.12)',
                borderColor: ehReceita ? 'rgba(0, 255, 85, 0.3)' : 'rgba(255, 68, 68, 0.3)',
              },
            ]}>
            <Ionicons
              name={ehReceita ? 'trending-up-outline' : 'trending-down-outline'}
              size={14}
              color={ehReceita ? cores.primaria : cores.perigo}
            />
            <Texto
              variante="legenda"
              style={{
                color: ehReceita ? cores.primaria : cores.perigo,
                fontWeight: '700',
              }}>
              {ehReceita ? 'RECEITA' : 'DESPESA'}
            </Texto>
          </View>

          <View
            style={[
              estilos.seloSituacao,
              {
                backgroundColor: estaPaga ? 'rgba(0, 255, 85, 0.12)' : 'rgba(249, 156, 0, 0.15)',
                borderColor: estaPaga ? 'rgba(0, 255, 85, 0.3)' : 'rgba(249, 156, 0, 0.3)',
              },
            ]}>
            <Ionicons
              name={estaPaga ? 'checkmark-circle-outline' : 'time-outline'}
              size={14}
              color={estaPaga ? cores.primaria : cores.aviso}
            />
            <Texto
              variante="legenda"
              style={{
                color: estaPaga ? cores.primaria : cores.aviso,
                fontWeight: '700',
              }}>
              {estaPaga ? 'PAGA / RECEBIDA' : 'PENDENTE'}
            </Texto>
          </View>
        </View>

        <Texto
          variante="titulo"
          tom={ehReceita ? 'primaria' : estaPaga ? 'padrao' : 'perigo'}
          style={estilos.valorGrande}>
          {ehReceita ? '+ ' : '- '}
          {formatarMoeda(item.valorCentavos)}
        </Texto>

        <Texto variante="subtitulo" style={estilos.tituloDescricao}>
          {item.descricao}
        </Texto>
      </Cartao>

      {/* Cartão de Detalhes Adicionais */}
      <Cartao
        style={[
          estilos.cartaoDetalhes,
          {
            backgroundColor: cores.cartaoMetrica,
            borderColor: cores.borda,
          },
        ]}>
        <Texto variante="subtitulo" accessibilityRole="header">
          Dados da Operação
        </Texto>

        <View style={estilos.linhaDetalhe}>
          <View style={estilos.labelComIcone}>
            <Ionicons name="pricetag-outline" size={16} color={cores.primaria} />
            <Texto variante="legenda" tom="secundaria">
              Categoria
            </Texto>
          </View>
          <Texto variante="rotulo">{nomeCategoria}</Texto>
        </View>

        <View style={[estilos.divisorItem, { backgroundColor: cores.borda }]} />

        <View style={estilos.linhaDetalhe}>
          <View style={estilos.labelComIcone}>
            <Ionicons name="calendar-outline" size={16} color={cores.primaria} />
            <Texto variante="legenda" tom="secundaria">
              {ehReceita ? 'Data de recebimento' : 'Data de vencimento'}
            </Texto>
          </View>
          <Texto variante="rotulo">{formatarData(item.data)}</Texto>
        </View>

        <View style={[estilos.divisorItem, { backgroundColor: cores.borda }]} />

        <View style={estilos.linhaDetalhe}>
          <View style={estilos.labelComIcone}>
            <Ionicons name="key-outline" size={16} color={cores.primaria} />
            <Texto variante="legenda" tom="secundaria">
              Identificador (ID)
            </Texto>
          </View>
          <Texto variante="legenda" tom="secundaria" style={estilos.textoId}>
            {item.id}
          </Texto>
        </View>

        {!ehReceita && (item as Despesa).origem.tipo === 'parcela' && (
          <>
            <View style={[estilos.divisorItem, { backgroundColor: cores.borda }]} />
            <View style={estilos.linhaDetalhe}>
              <View style={estilos.labelComIcone}>
                <Ionicons name="link-outline" size={16} color={cores.primaria} />
                <Texto variante="legenda" tom="secundaria">
                  Origem
                </Texto>
              </View>
              <Texto variante="rotulo">Parcela de Dívida</Texto>
            </View>
          </>
        )}
      </Cartao>

      {/* Ações */}
      <View style={estilos.acoesContainer}>
        {!ehReceita && (
          <Botao
            titulo={estaPaga ? 'Reverter para Pendente' : 'Marcar como Paga'}
            variante={estaPaga ? 'secundaria' : 'primaria'}
            onPress={alternarSituacaoDespesa}
          />
        )}
        <Botao
          titulo="Voltar à lista"
          variante="secundaria"
          onPress={voltar}
        />
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  cabecalhoTopo: {
    gap: espacamentos.pequeno,
    marginBottom: espacamentos.medio,
  },
  botaoRetorno: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: espacamentos.minimo,
    alignSelf: 'flex-start',
  },
  cartaoDestaque: {
    padding: espacamentos.grande,
    gap: espacamentos.medio,
  },
  linhaSelo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.pequeno,
    flexWrap: 'wrap',
  },
  seloTipo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: espacamentos.medio,
    paddingVertical: 3,
    borderRadius: raios.capsula,
    borderWidth: 1,
  },
  seloSituacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: espacamentos.medio,
    paddingVertical: 3,
    borderRadius: raios.capsula,
    borderWidth: 1,
  },
  valorGrande: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  tituloDescricao: {
    fontSize: 18,
    lineHeight: 24,
  },
  cartaoDetalhes: {
    padding: espacamentos.grande,
    gap: espacamentos.medio,
    marginTop: espacamentos.medio,
  },
  linhaDetalhe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelComIcone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  divisorItem: {
    height: 1,
  },
  textoId: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  acoesContainer: {
    gap: espacamentos.medio,
    marginTop: espacamentos.grande,
    marginBottom: espacamentos.extraGrande,
  },
  conteudoCentralizado: {
    flex: 1,
    justifyContent: 'center',
    padding: espacamentos.grande,
  },
  cartaoNaoEncontrado: {
    alignItems: 'center',
    padding: espacamentos.extraGrande,
    gap: espacamentos.medio,
  },
  iconeVazio: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoNaoEncontrado: {
    textAlign: 'center',
  },
  botaoVoltarErro: {
    marginTop: espacamentos.medio,
    width: '100%',
  },
});
