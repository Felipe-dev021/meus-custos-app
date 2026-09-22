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
import type { Despesa } from '@/dominio/financeiro';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { espacamentos, raios } from '@/tema';
import { useTema } from '@/tema/ContextoTema';
import { formatarData, formatarMoeda, paraDataCivil } from '@/utilitarios/formatacao';

type FiltroSituacao = 'todas' | 'pagas' | 'pendentes';

export default function TelaDespesas() {
  const navegador = useRouter();
  const { despesas, resumo, executar } = useFinanceiro();
  const { cores } = useTema();

  const [busca, definirBusca] = useState('');
  const [filtro, definirFiltro] = useState<FiltroSituacao>('todas');

  const contagemPagas = useMemo(
    () => despesas.filter((item) => item.situacao === 'paga').length,
    [despesas],
  );
  const contagemPendentes = useMemo(
    () => despesas.filter((item) => item.situacao === 'pendente').length,
    [despesas],
  );

  const despesasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return despesas.filter((item) => {
      // Filtro de situação
      if (filtro === 'pagas' && item.situacao !== 'paga') return false;
      if (filtro === 'pendentes' && item.situacao !== 'pendente') return false;

      // Filtro de busca (descrição ou categoria)
      if (!termo) return true;
      const nomeCategoria = (categoriasDespesa[item.categoria] ?? item.categoria).toLowerCase();
      const descricao = item.descricao.toLowerCase();
      return descricao.includes(termo) || nomeCategoria.includes(termo);
    });
  }, [despesas, busca, filtro]);

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
          {/* Card 1: Total de Despesas */}
          <Cartao
            style={[
              estilos.cartaoMetrica,
              {
                backgroundColor: cores.cartaoMetrica,
                borderColor: cores.borda,
              },
            ]}>
            <View style={[estilos.iconeCaixa, { backgroundColor: cores.iconeCaixa }]}>
              <Ionicons name="card-outline" size={18} color={cores.texto} />
            </View>
            <Texto variante="legenda" tom="secundaria">Total de despesas</Texto>
            <Texto
              variante="subtitulo"
              numberOfLines={1}
              style={[estilos.valorMetrica, { color: cores.texto }]}>
              {formatarMoeda(resumo.despesasPagas + resumo.despesasPendentes)}
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
            <Texto variante="legenda" tom="secundaria">Despesas pagas</Texto>
            <Texto
              variante="subtitulo"
              numberOfLines={1}
              style={[estilos.valorMetrica, { color: cores.texto }]}>
              {formatarMoeda(resumo.despesasPagas)}
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
          <Texto variante="legenda" tom="secundaria">Despesas pendentes</Texto>
          <Texto
            variante="subtitulo"
            tom={resumo.despesasPendentes > 0 ? 'perigo' : 'padrao'}
            numberOfLines={1}
            style={estilos.valorMetrica}>
            {formatarMoeda(resumo.despesasPendentes)}
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
              {busca || filtro !== 'todas'
                ? `Total do filtro: ${formatarMoeda(totalExibido)}`
                : 'Toque na situação para alternar entre paga e pendente'}
            </Texto>
          </View>
        </View>

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
            accessibilityLabel={`Filtrar por todas as despesas. Total: ${despesas.length}`}
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
              {`Todas (${despesas.length})`}
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
});
