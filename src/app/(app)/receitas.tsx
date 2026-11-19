import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CabecalhoNavegacao } from '@/componentes/CabecalhoNavegacao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Cartao } from '@/componentes/Cartao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import { categoriasReceita } from '@/dominio/categorias';
import { calcularTotalPrevistoMes, filtrarLancamentosPorMes } from '@/dominio/consultas-financeiras';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { espacamentos, raios } from '@/tema';
import { useTema } from '@/tema/ContextoTema';
import { formatarData, formatarMoeda, paraDataCivil } from '@/utilitarios/formatacao';

type OrdenacaoReceita = 'recentes' | 'maior-valor' | 'menor-valor';

export default function TelaReceitas() {
  const navegador = useRouter();
  const { receitas, resumo } = useFinanceiro();
  const { cores } = useTema();
  const [busca, definirBusca] = useState('');
  const [ordenacao, definirOrdenacao] = useState<OrdenacaoReceita>('recentes');
  const [apenasMesAtual, definirApenasMesAtual] = useState(false);

  const mesAtual = useMemo(() => paraDataCivil(new Date()).slice(0, 7), []);

  const contagemMesAtual = useMemo(
    () => receitas.filter((item) => item.data.slice(0, 7) === mesAtual).length,
    [receitas, mesAtual],
  );

  const totalMesAtual = useMemo(
    () => calcularTotalPrevistoMes(receitas, 'receita', mesAtual),
    [receitas, mesAtual],
  );

  const receitasBase = useMemo(() => {
    if (!apenasMesAtual) return receitas;
    return filtrarLancamentosPorMes(receitas, mesAtual);
  }, [receitas, apenasMesAtual, mesAtual]);

  const receitasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const filtradas = !termo
      ? receitasBase
      : receitasBase.filter((item) => {
          const nomeCategoria = (categoriasReceita[item.categoria] ?? item.categoria).toLowerCase();
          const descricao = item.descricao.toLowerCase();
          return descricao.includes(termo) || nomeCategoria.includes(termo);
        });

    if (ordenacao === 'maior-valor') {
      return [...filtradas].sort((a, b) => b.valorCentavos - a.valorCentavos);
    }
    if (ordenacao === 'menor-valor') {
      return [...filtradas].sort((a, b) => a.valorCentavos - b.valorCentavos);
    }
    return filtradas;
  }, [receitasBase, busca, ordenacao]);

  const totalExibido = useMemo(() => {
    if (!busca.trim() && !apenasMesAtual) return resumo.receitasRecebidas;
    if (!busca.trim() && apenasMesAtual) return totalMesAtual;
    return receitasFiltradas.reduce((total, item) => total + item.valorCentavos, 0);
  }, [busca, apenasMesAtual, resumo.receitasRecebidas, totalMesAtual, receitasFiltradas]);

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
          {/* Card 1: Total de entradas ou Previsto no mês */}
          <Cartao
            style={[
              estilos.cartaoMetrica,
              {
                backgroundColor: cores.cartaoMetrica,
                borderColor: cores.borda,
              },
            ]}>
            <View style={[estilos.iconeCaixa, { backgroundColor: cores.iconeCaixa }]}>
              <Ionicons
                name={apenasMesAtual ? 'calendar-outline' : 'cash-outline'}
                size={18}
                color={cores.primaria}
              />
            </View>
            <Texto variante="legenda" tom="secundaria">
              {apenasMesAtual ? 'Previsto esse mês' : 'Total de entradas'}
            </Texto>
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
              <Ionicons name="trending-up-outline" size={18} color={cores.texto} />
            </View>
            <Texto variante="legenda" tom="secundaria">
              {apenasMesAtual ? 'Receitas no mês' : 'Receitas registradas'}
            </Texto>
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
            <Ionicons name="calculator-outline" size={18} color={cores.texto} />
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
              {apenasMesAtual
                ? `Previsto para este mês: ${formatarMoeda(totalMesAtual)}`
                : 'Ordenadas por data de recebimento'}
            </Texto>
          </View>
        </View>

        {/* Filtro de Período: Todas vs Previsto esse mês */}
        <View style={estilos.linhaFiltros}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Exibir todas as receitas (${receitas.length})`}
            accessibilityState={{ selected: !apenasMesAtual }}
            onPress={() => definirApenasMesAtual(false)}
            style={[
              estilos.botaoFiltro,
              {
                backgroundColor: !apenasMesAtual ? cores.primaria : cores.superficieElevada,
                borderColor: !apenasMesAtual ? cores.primaria : cores.borda,
              },
            ]}>
            <Texto
              variante="rotulo"
              style={[
                estilos.textoFiltro,
                { color: !apenasMesAtual ? cores.sobrePrimaria : cores.texto },
              ]}>
              {`Todas (${receitas.length})`}
            </Texto>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Exibir apenas receitas previstas para esse mês (${contagemMesAtual})`}
            accessibilityState={{ selected: apenasMesAtual }}
            onPress={() => definirApenasMesAtual((prev) => !prev)}
            style={[
              estilos.botaoFiltro,
              {
                backgroundColor: apenasMesAtual ? cores.primaria : cores.superficieElevada,
                borderColor: apenasMesAtual ? cores.primaria : cores.borda,
              },
            ]}>
            <View style={estilos.conteudoBotaoPrevisto}>
              <Ionicons
                name="calendar-outline"
                size={15}
                color={apenasMesAtual ? cores.sobrePrimaria : cores.primaria}
                style={{ marginRight: 5 }}
              />
              <Texto
                variante="rotulo"
                style={[
                  estilos.textoFiltro,
                  { color: apenasMesAtual ? cores.sobrePrimaria : cores.texto },
                ]}>
                {`Previsto esse mês (${contagemMesAtual})`}
              </Texto>
            </View>
          </Pressable>
        </View>

        {/* Aviso de filtro ativo quando 'Previsto esse mês' estiver habilitado */}
        {apenasMesAtual ? (
          <View
            style={[
              estilos.avisoFiltroAtivo,
              { backgroundColor: cores.superficieElevada, borderColor: cores.borda },
            ]}>
            <Ionicons name="information-circle-outline" size={16} color={cores.primaria} />
            <Texto variante="legenda" tom="secundaria" style={{ flex: 1, marginLeft: 6 }}>
              {`Contando apenas receitas previstas para o mês atual (${formatarMoeda(totalMesAtual)})`}
            </Texto>
            <Pressable onPress={() => definirApenasMesAtual(false)} hitSlop={8}>
              <Texto variante="legenda" tom="primaria" style={{ fontWeight: '600' }}>
                Ver todas
              </Texto>
            </Pressable>
          </View>
        ) : null}

        {/* Campo de Busca integrado */}
        <CampoTexto
          rotulo="Filtrar receitas"
          placeholder="Buscar por descrição ou categoria..."
          value={busca}
          onChangeText={definirBusca}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Barra de Ordenação */}
        <View style={estilos.linhaOrdenacao}>
          <Texto variante="legenda" tom="secundaria">Ordenar:</Texto>
          {(
            [
              { id: 'recentes', rotulo: 'Mais recentes' },
              { id: 'maior-valor', rotulo: 'Maior valor' },
              { id: 'menor-valor', rotulo: 'Menor valor' },
            ] as const
          ).map((opcao) => {
            const ativo = ordenacao === opcao.id;
            return (
              <Pressable
                key={opcao.id}
                accessibilityRole="button"
                accessibilityState={{ selected: ativo }}
                onPress={() => definirOrdenacao(opcao.id)}
                style={[
                  estilos.chipOrdenacao,
                  {
                    backgroundColor: ativo ? cores.superficieElevada : 'transparent',
                    borderColor: ativo ? cores.primaria : cores.borda,
                  },
                ]}>
                <Texto
                  variante="legenda"
                  style={{
                    color: ativo ? cores.primaria : cores.textoSecundario,
                    fontWeight: ativo ? '600' : '400',
                  }}>
                  {opcao.rotulo}
                </Texto>
              </Pressable>
            );
          })}
        </View>

        {/* Cabeçalho da Lista / Tabela */}
        <View style={[estilos.cabecalhoTabela, { borderBottomColor: cores.borda }]}>
          <Texto
            variante="legenda"
            style={[estilos.colunaCabecalhoDescricao, { color: cores.textoMutado }]}>
            TRANSAÇÃO
          </Texto>
          <Texto
            variante="legenda"
            style={[estilos.colunaCabecalhoValor, { color: cores.textoMutado }]}>
            VALOR
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
                <View style={estilos.infoItemPrincipal}>
                  <Texto
                    variante="corpo"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={estilos.textoDescricao}>
                    {item.descricao}
                  </Texto>
                  <View style={estilos.linhaMetaItem}>
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
                        numberOfLines={1}
                        style={estilos.textoCategoriaPill}>
                        {categoriasReceita[item.categoria] ?? item.categoria}
                      </Texto>
                    </View>
                    <Texto variante="legenda" tom="secundaria" style={estilos.textoDataPequena}>
                      {formatarData(item.data)}
                    </Texto>
                  </View>
                </View>

                <View style={estilos.colunaValor}>
                  <Texto variante="rotulo" tom="primaria" style={estilos.textoValorVerde}>
                    {`+ ${formatarMoeda(item.valorCentavos)}`}
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
    justifyContent: 'space-between',
    paddingBottom: espacamentos.pequeno,
    borderBottomWidth: 1,
  },
  colunaCabecalhoDescricao: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  colunaCabecalhoValor: {
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
    justifyContent: 'space-between',
    paddingVertical: espacamentos.medio,
  },
  separadorLinha: {
    borderTopWidth: 1,
  },
  infoItemPrincipal: {
    flex: 1,
    paddingRight: espacamentos.pequeno,
    gap: 4,
  },
  textoDescricao: {
    fontWeight: '600',
    fontSize: 15,
  },
  linhaMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  tagCategoriaPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: raios.capsula,
    borderWidth: 1,
  },
  textoCategoriaPill: {
    fontSize: 11,
    lineHeight: 14,
  },
  textoDataPequena: {
    fontSize: 12,
  },
  colunaValor: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textoValorVerde: {
    fontWeight: '700',
    fontSize: 15,
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
  linhaOrdenacao: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: espacamentos.pequeno,
  },
  chipOrdenacao: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: raios.capsula,
    borderWidth: 1,
  },
  linhaFiltros: {
    flexDirection: 'row',
    gap: espacamentos.pequeno,
    marginBottom: espacamentos.medio,
  },
  botaoFiltro: {
    flex: 1,
    paddingVertical: espacamentos.pequeno,
    paddingHorizontal: espacamentos.pequeno,
    borderRadius: raios.medio,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoFiltro: {
    fontWeight: '600',
  },
  conteudoBotaoPrevisto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avisoFiltroAtivo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: espacamentos.pequeno,
    borderRadius: raios.medio,
    borderWidth: 1,
    marginBottom: espacamentos.medio,
  },
});
