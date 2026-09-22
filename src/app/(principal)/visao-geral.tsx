import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { CabecalhoNavegacao } from '@/componentes/CabecalhoNavegacao';
import { Cartao } from '@/componentes/Cartao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import { categoriasDespesa, categoriasReceita } from '@/dominio/categorias';
import type { Lancamento } from '@/dominio/financeiro';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { espacamentos, raios } from '@/tema';
import { useTema } from '@/tema/ContextoTema';
import { formatarData, formatarMoeda } from '@/utilitarios/formatacao';

export default function TelaVisaoGeral() {
  const navegador = useRouter();
  const { resumo, gastosPorCategoria, ultimosLancamentos, dados } = useFinanceiro();
  const { cores } = useTema();

  function obterNomeCategoria(lancamento: Lancamento): string {
    if (lancamento.tipo === 'receita') {
      return categoriasReceita[lancamento.categoria] ?? lancamento.categoria;
    }
    return categoriasDespesa[lancamento.categoria] ?? lancamento.categoria;
  }

  const maiorGasto = gastosPorCategoria[0]?.valorCentavos ?? 0;

  return (
    <Tela edges={['top', 'right', 'left']}>
      {/* Topo com Logo e Menu Hambúrguer */}
      <CabecalhoNavegacao rotaAtiva="visao-geral" />

      {/* Título e Botão de Ação rápida */}
      <View style={estilos.cabecalhoSecao}>
        <View style={estilos.textosTitulo}>
          <Texto variante="titulo" accessibilityRole="header">
            Visão geral
          </Texto>
          <Texto tom="secundaria">
            Olá, {dados.perfil.nome || 'usuário'}. Acompanhe seu saldo e suas movimentações.
          </Texto>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cadastrar novo lançamento"
          onPress={() => navegador.push('/novo-lancamento')}
          style={[estilos.botaoAcaoVerde, { backgroundColor: cores.primaria }]}>
          <Texto
            variante="rotulo"
            style={[estilos.textoBotaoAcao, { color: cores.sobrePrimaria }]}>
            + Novo lançamento
          </Texto>
        </Pressable>
      </View>

      {/* Grade de Cartões de Métricas */}
      <View style={estilos.gradeMetricas}>
        <View style={estilos.linhaMetricas}>
          {/* Card 1: Saldo Disponível */}
          <Cartao
            style={[
              estilos.cartaoMetrica,
              {
                backgroundColor: cores.cartaoMetrica,
                borderColor: cores.borda,
              },
            ]}>
            <View style={[estilos.iconeCaixa, { backgroundColor: cores.iconeCaixa }]}>
              <Ionicons name="wallet-outline" size={18} color={cores.primaria} />
            </View>
            <Texto variante="legenda" tom="secundaria">Saldo disponível</Texto>
            <Texto
              variante="subtitulo"
              tom={resumo.saldoDisponivel >= 0 ? 'primaria' : 'perigo'}
              numberOfLines={1}
              style={estilos.valorMetrica}>
              {formatarMoeda(resumo.saldoDisponivel)}
            </Texto>
          </Cartao>

          {/* Card 2: Previsão */}
          <Cartao
            style={[
              estilos.cartaoMetrica,
              {
                backgroundColor: cores.cartaoMetrica,
                borderColor: cores.borda,
              },
            ]}>
            <View style={[estilos.iconeCaixa, { backgroundColor: cores.iconeCaixa }]}>
              <Ionicons name="calendar-outline" size={18} color={cores.texto} />
            </View>
            <Texto variante="legenda" tom="secundaria">Previsão fim do mês</Texto>
            <Texto
              variante="subtitulo"
              numberOfLines={1}
              style={[estilos.valorMetrica, { color: cores.texto }]}>
              {formatarMoeda(resumo.saldoPrevisto)}
            </Texto>
          </Cartao>
        </View>

        <View style={estilos.linhaMetricas}>
          {/* Card 3: Receitas */}
          <Cartao
            style={[
              estilos.cartaoMetrica,
              {
                backgroundColor: cores.cartaoMetrica,
                borderColor: cores.borda,
              },
            ]}>
            <View style={[estilos.iconeCaixa, { backgroundColor: cores.iconeCaixa }]}>
              <Ionicons name="trending-up-outline" size={18} color={cores.primaria} />
            </View>
            <Texto variante="legenda" tom="secundaria">Total de receitas</Texto>
            <Texto
              variante="subtitulo"
              tom="primaria"
              numberOfLines={1}
              style={estilos.valorMetrica}>
              {formatarMoeda(resumo.receitasRecebidas)}
            </Texto>
          </Cartao>

          {/* Card 4: Despesas pagas */}
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
            <Texto variante="legenda" tom="secundaria">Despesas pagas</Texto>
            <Texto
              variante="subtitulo"
              numberOfLines={1}
              style={[estilos.valorMetrica, { color: cores.texto }]}>
              {formatarMoeda(resumo.despesasPagas)}
            </Texto>
          </Cartao>
        </View>
      </View>

      {/* Gastos por categoria */}
      <Cartao
        style={[
          estilos.painel,
          {
            backgroundColor: cores.cartaoMetrica,
            borderColor: cores.borda,
          },
        ]}>
        <Texto variante="subtitulo" accessibilityRole="header">
          Gastos por categoria
        </Texto>
        <Texto variante="legenda" tom="secundaria">
          Distribuição percentual das despesas pagas
        </Texto>

        {gastosPorCategoria.length === 0 ? (
          <Texto tom="secundaria" style={estilos.mensagemVazia}>
            Nenhum gasto pago registrado até o momento.
          </Texto>
        ) : (
          <View style={estilos.listaCategorias}>
            {gastosPorCategoria.map((item) => {
              const porcentagem = resumo.despesasPagas > 0
                ? Math.round((item.valorCentavos / resumo.despesasPagas) * 100)
                : 0;
              const larguraBarra = maiorGasto > 0
                ? Math.max(8, Math.round((item.valorCentavos / maiorGasto) * 100))
                : 0;

              return (
                <View key={item.categoria} style={estilos.itemCategoria}>
                  <View style={estilos.cabecalhoCategoria}>
                    <Texto variante="corpo" style={estilos.nomeCategoria}>
                      {categoriasDespesa[item.categoria] ?? item.categoria}
                    </Texto>
                    <View style={estilos.valoresCategoria}>
                      <Texto variante="rotulo">
                        {formatarMoeda(item.valorCentavos)}
                      </Texto>
                      <Texto variante="legenda" tom="secundaria">
                        {porcentagem}%
                      </Texto>
                    </View>
                  </View>
                  <View style={[estilos.trilhoBarra, { backgroundColor: cores.superficieElevada }]}>
                    <View
                      style={[
                        estilos.progressoBarra,
                        {
                          width: `${larguraBarra}%`,
                          backgroundColor: cores.primaria,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Cartao>

      {/* Últimos lançamentos */}
      <Cartao
        style={[
          estilos.painel,
          {
            backgroundColor: cores.cartaoMetrica,
            borderColor: cores.borda,
          },
        ]}>
        <View style={estilos.cabecalhoSecaoLista}>
          <View>
            <Texto variante="subtitulo" accessibilityRole="header">
              Lançamentos recentes
            </Texto>
            <Texto variante="legenda" tom="secundaria">
              Últimas movimentações registradas
            </Texto>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver todas as receitas"
            onPress={() => navegador.push('/(principal)/receitas')}>
            <Texto variante="legenda" tom="primaria">
              Ver receitas →
            </Texto>
          </Pressable>
        </View>

        {ultimosLancamentos.length === 0 ? (
          <Texto tom="secundaria" style={estilos.mensagemVazia}>
            Nenhum lançamento cadastrado.
          </Texto>
        ) : (
          <View style={estilos.listaLancamentos}>
            {ultimosLancamentos.map((item, index) => {
              const ehReceita = item.tipo === 'receita';
              const estaPaga = ehReceita || item.situacao === 'paga';

              return (
                <View
                  key={item.id}
                  style={[
                    estilos.itemLancamento,
                    index > 0 && [estilos.separadorLancamento, { borderTopColor: cores.borda }],
                  ]}>
                  <View style={estilos.infoLancamento}>
                    <Texto variante="corpo" style={estilos.descricaoLancamento}>
                      {item.descricao}
                    </Texto>
                    <View style={estilos.linhaMetaLancamento}>
                      <Texto variante="legenda" tom="secundaria">
                        {obterNomeCategoria(item)} · {formatarData(item.data)}
                      </Texto>
                      {!estaPaga && (
                        <View style={estilos.tagPendente}>
                          <Texto
                            variante="legenda"
                            style={[estilos.textoTagPendente, { color: cores.aviso }]}>
                            Pendente
                          </Texto>
                        </View>
                      )}
                    </View>
                  </View>

                  <Texto
                    variante="rotulo"
                    tom={ehReceita ? 'primaria' : estaPaga ? 'padrao' : 'secundaria'}
                    style={estilos.valorLancamento}>
                    {ehReceita ? '+ ' : '- '}
                    {formatarMoeda(item.valorCentavos)}
                  </Texto>
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
  iconeCaixa: {
    width: 32,
    height: 32,
    borderRadius: raios.pequeno - 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  valorMetrica: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  painel: {
    gap: espacamentos.medio,
  },
  cabecalhoSecaoLista: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mensagemVazia: {
    paddingVertical: espacamentos.medio,
  },
  listaCategorias: {
    gap: espacamentos.grande,
    marginTop: espacamentos.pequeno,
  },
  itemCategoria: {
    gap: espacamentos.pequeno,
  },
  cabecalhoCategoria: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nomeCategoria: {
    fontWeight: '500',
  },
  valoresCategoria: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.pequeno,
  },
  trilhoBarra: {
    height: 6,
    borderRadius: raios.capsula,
    overflow: 'hidden',
  },
  progressoBarra: {
    height: '100%',
    borderRadius: raios.capsula,
  },
  listaLancamentos: {
    marginTop: espacamentos.pequeno,
  },
  itemLancamento: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: espacamentos.medio,
  },
  separadorLancamento: {
    borderTopWidth: 1,
  },
  infoLancamento: {
    flex: 1,
    gap: 2,
    marginRight: espacamentos.medio,
  },
  descricaoLancamento: {
    fontWeight: '600',
  },
  linhaMetaLancamento: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.pequeno,
  },
  tagPendente: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: raios.capsula,
    backgroundColor: 'rgba(249, 156, 0, 0.15)',
  },
  textoTagPendente: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
  },
  valorLancamento: {
    fontWeight: '700',
  },
});
