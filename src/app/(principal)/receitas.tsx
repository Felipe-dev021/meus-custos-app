import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CabecalhoNavegacao } from '@/componentes/CabecalhoNavegacao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Cartao } from '@/componentes/Cartao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import { categoriasReceita } from '@/dominio/categorias';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { espacamentos, raios } from '@/tema';
import { useTema } from '@/tema/ContextoTema';
import { formatarData, formatarMoeda } from '@/utilitarios/formatacao';

export default function TelaReceitas() {
  const navegador = useRouter();
  const { receitas, resumo } = useFinanceiro();
  const { cores } = useTema();
  const [busca, definirBusca] = useState('');

  const receitasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return receitas;

    return receitas.filter((item) => {
      const nomeCategoria = (categoriasReceita[item.categoria] ?? item.categoria).toLowerCase();
      const descricao = item.descricao.toLowerCase();
      return descricao.includes(termo) || nomeCategoria.includes(termo);
    });
  }, [receitas, busca]);

  const totalExibido = useMemo(() => {
    if (!busca.trim()) return resumo.receitasRecebidas;
    return receitasFiltradas.reduce((total, item) => total + item.valorCentavos, 0);
  }, [busca, receitasFiltradas, resumo.receitasRecebidas]);

  const mediaPorLancamento = useMemo(() => {
    if (receitasFiltradas.length === 0) return 0;
    return Math.round(totalExibido / receitasFiltradas.length);
  }, [receitasFiltradas.length, totalExibido]);

  return (
    <Tela edges={['top', 'right', 'left']}>
      {/* Topo com Logo e Menu Hambúrguer */}
      <CabecalhoNavegacao rotaAtiva="receitas" />

      {/* Título da Tela e Botão de Ação rápida */}
      <View style={estilos.cabecalhoSecao}>
        <View style={estilos.textosTitulo}>
          <Texto variante="titulo" accessibilityRole="header">
            {'Receitas (rendas)'}
          </Texto>
          <Texto tom="secundaria">
            Registre e acompanhe suas entradas por data de recebimento
          </Texto>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cadastrar nova receita"
          onPress={() => navegador.push({ pathname: '/novo-lancamento', params: { tipo: 'receita' } })}
          style={[estilos.botaoAcaoVerde, { backgroundColor: cores.primaria }]}>
          <Texto
            variante="rotulo"
            style={[estilos.textoBotaoAcao, { color: cores.sobrePrimaria }]}>
            + Nova receita
          </Texto>
        </Pressable>
      </View>

      {/* Grade de Cartões de Métricas */}
      <View style={estilos.gradeMetricas}>
        <View style={estilos.linhaMetricas}>
          {/* Card 1: Total de entradas */}
          <Cartao
            style={[
              estilos.cartaoMetrica,
              {
                backgroundColor: cores.cartaoMetrica,
                borderColor: cores.borda,
              },
            ]}>
            <View style={[estilos.iconeCaixa, { backgroundColor: cores.iconeCaixa }]}>
              <Texto variante="rotulo" style={{ color: cores.texto }}>$</Texto>
            </View>
            <Texto variante="legenda" tom="secundaria">Total de entradas</Texto>
            <Texto
              variante="subtitulo"
              numberOfLines={1}
              style={[estilos.valorMetrica, { color: cores.texto }]}>
              {formatarMoeda(totalExibido)}
            </Texto>
          </Cartao>

          {/* Card 2: Receitas registradas */}
          <Cartao
            style={[
              estilos.cartaoMetrica,
              {
                backgroundColor: cores.cartaoMetrica,
                borderColor: cores.borda,
              },
            ]}>
            <View style={[estilos.iconeCaixa, { backgroundColor: cores.iconeCaixa }]}>
              <Texto variante="rotulo" style={{ color: cores.texto }}>↗</Texto>
            </View>
            <Texto variante="legenda" tom="secundaria">Receitas registradas</Texto>
            <Texto
              variante="subtitulo"
              numberOfLines={1}
              style={[estilos.valorMetrica, { color: cores.texto }]}>
              {receitasFiltradas.length}
            </Texto>
          </Cartao>
        </View>

        {/* Card 3: Média por lançamento */}
        <Cartao
          style={[
            estilos.cartaoMetricaUnico,
            {
              backgroundColor: cores.cartaoMetrica,
              borderColor: cores.borda,
            },
          ]}>
          <View style={[estilos.iconeCaixa, { backgroundColor: cores.iconeCaixa }]}>
            <Texto variante="rotulo" style={{ color: cores.texto }}>📅</Texto>
          </View>
          <Texto variante="legenda" tom="secundaria">Média por lançamento</Texto>
          <Texto
            variante="subtitulo"
            numberOfLines={1}
            style={[estilos.valorMetrica, { color: cores.texto }]}>
            {formatarMoeda(mediaPorLancamento)}
          </Texto>
        </Cartao>
      </View>

      {/* Painel com Tabela/Lista de Entradas */}
      <Cartao
        style={[
          estilos.painelLista,
          {
            backgroundColor: cores.cartaoMetrica,
            borderColor: cores.borda,
          },
        ]}>
        <View style={estilos.topoPainel}>
          <View>
            <Texto variante="subtitulo" accessibilityRole="header">
              Entradas registradas
            </Texto>
            <Texto variante="legenda" tom="secundaria">
              Ordenadas por data de recebimento
            </Texto>
          </View>
        </View>

        {/* Campo de Busca integrado */}
        <CampoTexto
          rotulo="Filtrar receitas"
          placeholder="Buscar por descrição ou categoria..."
          value={busca}
          onChangeText={definirBusca}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Cabeçalho da Lista / Tabela */}
        <View style={[estilos.cabecalhoTabela, { borderBottomColor: cores.borda }]}>
          <Texto
            variante="legenda"
            style={[estilos.colunaCabecalhoDescricao, { color: cores.textoMutado }]}>
            DESCRIÇÃO
          </Texto>
          <Texto
            variante="legenda"
            style={[estilos.colunaCabecalhoCategoria, { color: cores.textoMutado }]}>
            CATEGORIA
          </Texto>
          <Texto
            variante="legenda"
            style={[estilos.colunaCabecalhoData, { color: cores.textoMutado }]}>
            DATA / VALOR
          </Texto>
        </View>

        {receitas.length === 0 ? (
          <View style={estilos.areaVazia}>
            <Texto tom="secundaria">Nenhuma receita registrada até o momento.</Texto>
          </View>
        ) : receitasFiltradas.length === 0 ? (
          <View style={estilos.areaVazia}>
            <Texto tom="secundaria">
              {`Nenhuma receita encontrada para "${busca}".`}
            </Texto>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpar busca"
              onPress={() => definirBusca('')}
              style={estilos.botaoLimparBusca}>
              <Texto variante="rotulo" tom="primaria">
                Limpar busca
              </Texto>
            </Pressable>
          </View>
        ) : (
          <View style={estilos.listaItens}>
            {receitasFiltradas.map((item, index) => (
              <View
                key={item.id}
                style={[
                  estilos.linhaTabela,
                  index > 0 && [estilos.separadorLinha, { borderTopColor: cores.borda }],
                ]}>
                <View style={estilos.colunaDescricao}>
                  <Texto variante="corpo" style={estilos.textoDescricao}>
                    {item.descricao}
                  </Texto>
                </View>

                <View style={estilos.colunaCategoria}>
                  <View
                    style={[
                      estilos.tagCategoriaPill,
                      {
                        backgroundColor: cores.tagPill,
                        borderColor: cores.borda,
                      },
                    ]}>
                    <Texto
                      variante="legenda"
                      tom="secundaria"
                      style={estilos.textoCategoriaPill}>
                      {categoriasReceita[item.categoria] ?? item.categoria}
                    </Texto>
                  </View>
                </View>

                <View style={estilos.colunaValorData}>
                  <Texto variante="rotulo" tom="primaria" style={estilos.textoValorVerde}>
                    {formatarMoeda(item.valorCentavos)}
                  </Texto>
                  <Texto variante="legenda" tom="secundaria" style={estilos.textoDataPequena}>
                    {formatarData(item.data)}
                  </Texto>
                </View>
              </View>
            ))}
          </View>
        )}
      </Cartao>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  cabecalhoSecao: {
    gap: espacamentos.medio,
  },
  textosTitulo: {
    gap: 4,
  },
  botaoAcaoVerde: {
    alignSelf: 'flex-start',
    paddingHorizontal: espacamentos.grande,
    paddingVertical: espacamentos.medio - 2,
    borderRadius: raios.pequeno,
  },
  textoBotaoAcao: {
    fontWeight: '700',
  },
  gradeMetricas: {
    gap: espacamentos.medio,
  },
  linhaMetricas: {
    flexDirection: 'row',
    gap: espacamentos.medio,
  },
  cartaoMetrica: {
    flex: 1,
    padding: espacamentos.grande,
    gap: espacamentos.pequeno,
  },
  cartaoMetricaUnico: {
    padding: espacamentos.grande,
    gap: espacamentos.pequeno,
  },
  iconeCaixa: {
    width: 32,
    height: 32,
    borderRadius: raios.pequeno - 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  valorMetrica: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  painelLista: {
    gap: espacamentos.grande,
  },
  topoPainel: {
    gap: 4,
  },
  cabecalhoTabela: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: espacamentos.pequeno,
    borderBottomWidth: 1,
  },
  colunaCabecalhoDescricao: {
    flex: 1.4,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  colunaCabecalhoCategoria: {
    flex: 1.2,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  colunaCabecalhoData: {
    flex: 1.2,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'right',
  },
  listaItens: {
    gap: espacamentos.minimo,
  },
  linhaTabela: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: espacamentos.medio,
  },
  separadorLinha: {
    borderTopWidth: 1,
  },
  colunaDescricao: {
    flex: 1.4,
    paddingRight: 6,
  },
  textoDescricao: {
    fontWeight: '600',
    fontSize: 15,
  },
  colunaCategoria: {
    flex: 1.2,
    paddingRight: 6,
  },
  tagCategoriaPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: espacamentos.medio,
    paddingVertical: 4,
    borderRadius: raios.capsula,
    borderWidth: 1,
  },
  textoCategoriaPill: {
    fontSize: 12,
  },
  colunaValorData: {
    flex: 1.2,
    alignItems: 'flex-end',
    gap: 2,
  },
  textoValorVerde: {
    fontWeight: '700',
    fontSize: 14,
  },
  textoDataPequena: {
    fontSize: 12,
  },
  areaVazia: {
    paddingVertical: espacamentos.grande,
    alignItems: 'center',
    gap: espacamentos.medio,
  },
  botaoLimparBusca: {
    paddingVertical: espacamentos.pequeno,
    paddingHorizontal: espacamentos.medio,
  },
});
