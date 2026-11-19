import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CabecalhoNavegacao } from '@/componentes/CabecalhoNavegacao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Cartao } from '@/componentes/Cartao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import { categoriasDespesa } from '@/dominio/categorias';
import { calcularTotalPrevistoMes, filtrarLancamentosPorMes } from '@/dominio/consultas-financeiras';
import type { Despesa } from '@/dominio/financeiro';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { espacamentos, raios } from '@/tema';
import { useTema } from '@/tema/ContextoTema';
import { formatarData, formatarMoeda, paraDataCivil } from '@/utilitarios/formatacao';

type FiltroSituacao = 'todas' | 'pagas' | 'pendentes';
type OrdenacaoDespesa = 'recentes' | 'maior-valor' | 'menor-valor';

export default function TelaDespesas() {
  const navegador = useRouter();
  const { despesas, resumo, executar } = useFinanceiro();
  const { cores } = useTema();

  const [busca, definirBusca] = useState('');
  const [filtro, definirFiltro] = useState<FiltroSituacao>('todas');
  const [ordenacao, definirOrdenacao] = useState<OrdenacaoDespesa>('recentes');
  const [apenasMesAtual, definirApenasMesAtual] = useState(false);

  const mesAtual = useMemo(() => paraDataCivil(new Date()).slice(0, 7), []);

  const contagemMesAtual = useMemo(
    () => despesas.filter((item) => item.data.slice(0, 7) === mesAtual).length,
    [despesas, mesAtual],
  );

  const totalDespesasMes = useMemo(
    () => calcularTotalPrevistoMes(despesas, 'despesa', mesAtual),
    [despesas, mesAtual],
  );

  const despesasBase = useMemo(() => {
    if (!apenasMesAtual) return despesas;
    return filtrarLancamentosPorMes(despesas, mesAtual);
  }, [despesas, apenasMesAtual, mesAtual]);

  const contagemPagas = useMemo(
    () => despesasBase.filter((item) => item.situacao === 'paga').length,
    [despesasBase],
  );
  const contagemPendentes = useMemo(
    () => despesasBase.filter((item) => item.situacao === 'pendente').length,
    [despesasBase],
  );

  const totalPagasBase = useMemo(
    () =>
      despesasBase
        .filter((item) => item.situacao === 'paga')
        .reduce((tot, item) => tot + item.valorCentavos, 0),
    [despesasBase],
  );

  const totalPendentesBase = useMemo(
    () =>
      despesasBase
        .filter((item) => item.situacao === 'pendente')
        .reduce((tot, item) => tot + item.valorCentavos, 0),
    [despesasBase],
  );

  const despesasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    const filtradas = despesasBase.filter((item) => {
      // Filtro de situação
      if (filtro === 'pagas' && item.situacao !== 'paga') return false;
      if (filtro === 'pendentes' && item.situacao !== 'pendente') return false;

      // Filtro de busca (descrição ou categoria)
      if (!termo) return true;
      const nomeCategoria = (categoriasDespesa[item.categoria] ?? item.categoria).toLowerCase();
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
  }, [despesasBase, busca, filtro, ordenacao]);

  const totalExibido = useMemo(() => {
    return despesasFiltradas.reduce((total, item) => total + item.valorCentavos, 0);
  }, [despesasFiltradas]);

  function alternarSituacaoDespesa(item: Despesa) {
    const hoje = paraDataCivil(new Date());

    if (item.situacao === 'pendente') {
      executar({
        tipo: 'pagar-despesa',
        id: item.id,
        dataPagamento: hoje,
        hoje,
      });
    } else {
      if (item.origem.tipo === 'parcela') {
        Alert.alert(
          'Parcela vinculada',
          'Esta despesa foi gerada pelo pagamento de uma parcela de dívida. O gerenciamento de parcelas é realizado no módulo de Dívidas.',
          [
            { text: 'Entendi', style: 'cancel' },
            {
              text: 'Ir para Dívidas',
              onPress: () => navegador.push('/dividas'),
            },
          ],
        );
        return;
      }

      executar({
        tipo: 'reverter-pagamento-despesa',
        id: item.id,
      });
    }
  }

  return (
    <Tela edges={['top', 'right', 'left']}>
      {/* Topo com Logo e Menu Hambúrguer */}
      <CabecalhoNavegacao rotaAtiva="despesas" />

      {/* Título da Tela e Botão de Ação Rápida */}
      <View style={estilos.cabecalhoSecao}>
        <View style={estilos.textosTitulo}>
          <Texto variante="titulo" accessibilityRole="header">
            {'Despesas (gastos)'}
          </Texto>
          <Texto tom="secundaria">
            Controle suas saídas, vencimentos e pagamentos
          </Texto>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cadastrar nova despesa"
          onPress={() =>
            navegador.push({ pathname: '/novo-lancamento', params: { tipo: 'despesa' } })
          }
          style={[estilos.botaoAcaoVerde, { backgroundColor: cores.primaria }]}>
          <Texto
            variante="rotulo"
            style={[estilos.textoBotaoAcao, { color: cores.sobrePrimaria }]}>
            + Nova despesa
          </Texto>
        </Pressable>
      </View>

      {/* Grade de Métricas */}
      <View style={estilos.gradeMetricas}>
        <View style={estilos.linhaMetricas}>
          {/* Card 1: Total de Despesas ou Previsto no mês */}
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
                name={apenasMesAtual ? 'calendar-outline' : 'card-outline'}
                size={18}
                color={cores.texto}
              />
            </View>
            <Texto variante="legenda" tom="secundaria">
              {apenasMesAtual ? 'Previsto esse mês' : 'Total de despesas'}
            </Texto>
            <Texto
              variante="subtitulo"
              numberOfLines={1}
              style={[estilos.valorMetrica, { color: cores.texto }]}>
              {formatarMoeda(
                apenasMesAtual
                  ? totalDespesasMes
                  : resumo.despesasPagas + resumo.despesasPendentes,
              )}
            </Texto>
          </Cartao>

          {/* Card 2: Despesas Pagas */}
          <Cartao
            style={[
              estilos.cartaoMetrica,
              {
                backgroundColor: cores.cartaoMetrica,
                borderColor: cores.borda,
              },
            ]}>
            <View style={[estilos.iconeCaixa, { backgroundColor: cores.iconeCaixa }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color={cores.primaria} />
            </View>
            <Texto variante="legenda" tom="secundaria">
              {apenasMesAtual ? 'Pagas no mês' : 'Despesas pagas'}
            </Texto>
            <Texto
              variante="subtitulo"
              numberOfLines={1}
              style={[estilos.valorMetrica, { color: cores.texto }]}>
              {formatarMoeda(apenasMesAtual ? totalPagasBase : resumo.despesasPagas)}
            </Texto>
          </Cartao>
        </View>

        {/* Card 3: Despesas Pendentes */}
        <Cartao
          style={[
            estilos.cartaoMetricaUnico,
            {
              backgroundColor: cores.cartaoMetrica,
              borderColor: cores.borda,
            },
          ]}>
          <View style={[estilos.iconeCaixa, { backgroundColor: cores.iconeCaixa }]}>
            <Ionicons name="time-outline" size={18} color={cores.aviso} />
          </View>
          <Texto variante="legenda" tom="secundaria">
            {apenasMesAtual ? 'Pendentes no mês' : 'Despesas pendentes'}
          </Texto>
          <Texto
            variante="subtitulo"
            tom={
              (apenasMesAtual ? totalPendentesBase : resumo.despesasPendentes) > 0
                ? 'perigo'
                : 'padrao'
            }
            numberOfLines={1}
            style={estilos.valorMetrica}>
            {formatarMoeda(apenasMesAtual ? totalPendentesBase : resumo.despesasPendentes)}
          </Texto>
        </Cartao>
      </View>

      {/* Painel com Lista e Filtros */}
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
              Saídas registradas
            </Texto>
            <Texto variante="legenda" tom="secundaria">
              {apenasMesAtual
                ? `Previsto para este mês: ${formatarMoeda(totalDespesasMes)}`
                : busca || filtro !== 'todas'
                  ? `Total do filtro: ${formatarMoeda(totalExibido)}`
                  : 'Toque na situação para alternar entre paga e pendente'}
            </Texto>
          </View>
        </View>

        {/* Filtro de Período: Todo o período vs Previsto esse mês */}
        <View style={estilos.linhaPeriodo}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Exibir despesas de todo o período (${despesas.length})`}
            accessibilityState={{ selected: !apenasMesAtual }}
            onPress={() => definirApenasMesAtual(false)}
            style={[
              estilos.botaoPeriodo,
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
              {`Todo o período (${despesas.length})`}
            </Texto>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Exibir apenas despesas previstas para esse mês (${contagemMesAtual})`}
            accessibilityState={{ selected: apenasMesAtual }}
            onPress={() => definirApenasMesAtual((prev) => !prev)}
            style={[
              estilos.botaoPeriodo,
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
              {`Contando apenas despesas previstas para o mês atual (${formatarMoeda(totalDespesasMes)})`}
            </Texto>
            <Pressable onPress={() => definirApenasMesAtual(false)} hitSlop={8}>
              <Texto variante="legenda" tom="primaria" style={{ fontWeight: '600' }}>
                Ver todas
              </Texto>
            </Pressable>
          </View>
        ) : null}

        {/* Campo de Busca */}
        <CampoTexto
          rotulo="Filtrar despesas"
          placeholder="Buscar por descrição ou categoria..."
          value={busca}
          onChangeText={definirBusca}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Barra de Filtros Segmentados */}
        <View style={estilos.linhaFiltros}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Filtrar por todas as despesas. Total: ${despesasBase.length}`}
            accessibilityState={{ selected: filtro === 'todas' }}
            onPress={() => definirFiltro('todas')}
            style={[
              estilos.botaoFiltro,
              {
                backgroundColor: filtro === 'todas' ? cores.primaria : cores.superficieElevada,
                borderColor: filtro === 'todas' ? cores.primaria : cores.borda,
              },
            ]}>
            <Texto
              variante="rotulo"
              style={[
                estilos.textoFiltro,
                { color: filtro === 'todas' ? cores.sobrePrimaria : cores.texto },
              ]}>
              {`Todas (${despesasBase.length})`}
            </Texto>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Filtrar por despesas pagas. Total: ${contagemPagas}`}
            accessibilityState={{ selected: filtro === 'pagas' }}
            onPress={() => definirFiltro('pagas')}
            style={[
              estilos.botaoFiltro,
              {
                backgroundColor: filtro === 'pagas' ? cores.primaria : cores.superficieElevada,
                borderColor: filtro === 'pagas' ? cores.primaria : cores.borda,
              },
            ]}>
            <Texto
              variante="rotulo"
              style={[
                estilos.textoFiltro,
                { color: filtro === 'pagas' ? cores.sobrePrimaria : cores.texto },
              ]}>
              {`Pagas (${contagemPagas})`}
            </Texto>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Filtrar por despesas pendentes. Total: ${contagemPendentes}`}
            accessibilityState={{ selected: filtro === 'pendentes' }}
            onPress={() => definirFiltro('pendentes')}
            style={[
              estilos.botaoFiltro,
              {
                backgroundColor: filtro === 'pendentes' ? cores.primaria : cores.superficieElevada,
                borderColor: filtro === 'pendentes' ? cores.primaria : cores.borda,
              },
            ]}>
            <Texto
              variante="rotulo"
              style={[
                estilos.textoFiltro,
                { color: filtro === 'pendentes' ? cores.sobrePrimaria : cores.texto },
              ]}>
              {`Pendentes (${contagemPendentes})`}
            </Texto>
          </Pressable>
        </View>

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

        {/* Cabeçalho da Lista */}
        <View style={[estilos.cabecalhoTabela, { borderBottomColor: cores.borda }]}>
          <Texto
            variante="legenda"
            style={[estilos.colunaCabecalhoDescricao, { color: cores.textoMutado }]}>
            DESPESA
          </Texto>
          <Texto
            variante="legenda"
            style={[estilos.colunaCabecalhoValor, { color: cores.textoMutado }]}>
            VALOR / STATUS
          </Texto>
        </View>

        {/* Lista de Despesas */}
        {despesas.length === 0 ? (
          <View style={estilos.areaVazia}>
            <Texto tom="secundaria">Nenhuma despesa registrada até o momento.</Texto>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cadastrar primeira despesa"
              onPress={() =>
                navegador.push({ pathname: '/novo-lancamento', params: { tipo: 'despesa' } })
              }
              style={[estilos.botaoAcaoVerde, { backgroundColor: cores.primaria }]}>
              <Texto
                variante="rotulo"
                style={[estilos.textoBotaoAcao, { color: cores.sobrePrimaria }]}>
                + Cadastrar despesa
              </Texto>
            </Pressable>
          </View>
        ) : despesasFiltradas.length === 0 ? (
          <View style={estilos.areaVazia}>
            <Texto tom="secundaria">
              {busca
                ? `Nenhuma despesa encontrada para "${busca}".`
                : 'Nenhuma despesa encontrada neste filtro.'}
            </Texto>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpar busca e filtros"
              onPress={() => {
                definirBusca('');
                definirFiltro('todas');
              }}
              style={estilos.botaoLimparBusca}>
              <Texto variante="rotulo" tom="primaria">
                Limpar filtros
              </Texto>
            </Pressable>
          </View>
        ) : (
          <View style={estilos.listaItens}>
            {despesasFiltradas.map((item, index) => {
              const estaPaga = item.situacao === 'paga';

              return (
                <View
                  key={item.id}
                  style={[
                    estilos.linhaTabela,
                    index > 0 && [estilos.separadorLinha, { borderTopColor: cores.borda }],
                  ]}>
                  {/* Informações Principais: Descrição + Categoria e Data */}
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
                          {categoriasDespesa[item.categoria] ?? item.categoria}
                        </Texto>
                      </View>
                      <Texto variante="legenda" tom="secundaria" style={estilos.textoDataPequena}>
                        {formatarData(item.data)}
                      </Texto>
                    </View>
                  </View>

                  {/* Coluna Direita: Valor e Situação (Badge interativa) */}
                  <View style={estilos.colunaAcoesValor}>
                    <Texto
                      variante="rotulo"
                      tom={estaPaga ? 'padrao' : 'perigo'}
                      style={estilos.textoValor}>
                      {`- ${formatarMoeda(item.valorCentavos)}`}
                    </Texto>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Situação: ${estaPaga ? 'Paga' : 'Pendente'}. Toque para alternar.`}
                      onPress={() => alternarSituacaoDespesa(item)}
                      style={[
                        estilos.badgeSituacao,
                        estaPaga ? estilos.badgePaga : estilos.badgePendente,
                      ]}>
                      <Ionicons
                        name={estaPaga ? 'checkmark-circle-outline' : 'time-outline'}
                        size={12}
                        color={estaPaga ? cores.primaria : cores.aviso}
                      />
                      <Texto
                        variante="legenda"
                        style={[
                          estilos.textoBadgeSituacao,
                          { color: estaPaga ? cores.primaria : cores.aviso },
                        ]}>
                        {estaPaga ? 'Paga' : 'Pendente'}
                      </Texto>
                    </Pressable>
                  </View>
                </View>
              );
            })}
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
  linhaFiltros: {
    flexDirection: 'row',
    gap: espacamentos.pequeno,
  },
  botaoFiltro: {
    flex: 1,
    paddingVertical: espacamentos.pequeno,
    paddingHorizontal: 4,
    borderRadius: raios.pequeno,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoFiltro: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
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
  colunaAcoesValor: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    flexShrink: 0,
  },
  textoValor: {
    fontWeight: '700',
    fontSize: 15,
  },
  badgeSituacao: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: raios.pequeno,
    borderWidth: 1,
  },
  badgePaga: {
    backgroundColor: 'rgba(0, 255, 85, 0.1)',
    borderColor: 'rgba(0, 255, 85, 0.3)',
  },
  badgePendente: {
    backgroundColor: 'rgba(249, 156, 0, 0.12)',
    borderColor: 'rgba(249, 156, 0, 0.3)',
  },
  textoBadgeSituacao: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
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
  linhaPeriodo: {
    flexDirection: 'row',
    gap: espacamentos.pequeno,
    marginBottom: espacamentos.pequeno,
  },
  botaoPeriodo: {
    flex: 1,
    paddingVertical: espacamentos.pequeno,
    paddingHorizontal: espacamentos.pequeno,
    borderRadius: raios.medio,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: espacamentos.pequeno,
  },
});
