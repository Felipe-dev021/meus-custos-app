import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Botao } from '@/componentes/Botao';
import { Cartao } from '@/componentes/Cartao';
import { Marca } from '@/componentes/Marca';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import { categoriasDespesa, categoriasReceita } from '@/dominio/categorias';
import type { Lancamento } from '@/dominio/financeiro';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { cores, espacamentos, raios } from '@/tema';
import { formatarData, formatarMoeda } from '@/utilitarios/formatacao';

export default function TelaVisaoGeral() {
  const navegador = useRouter();
  const { resumo, gastosPorCategoria, ultimosLancamentos, dados } = useFinanceiro();

  function obterNomeCategoria(lancamento: Lancamento): string {
    if (lancamento.tipo === 'receita') {
      return categoriasReceita[lancamento.categoria] ?? lancamento.categoria;
    }
    return categoriasDespesa[lancamento.categoria] ?? lancamento.categoria;
  }

  const maiorGasto = gastosPorCategoria[0]?.valorCentavos ?? 0;

  return (
    <Tela edges={['top', 'right', 'left']}>
      <View style={estilos.topo}>
        <Marca />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Acessar perfil"
          onPress={() => navegador.push('/perfil')}
          style={estilos.botaoPerfilTopo}>
          <Texto variante="rotulo" tom="primaria">
            {dados.perfil.nome ? dados.perfil.nome.slice(0, 2).toUpperCase() : 'EU'}
          </Texto>
        </Pressable>
      </View>

      <View style={estilos.cabecalho}>
        <Texto variante="titulo" accessibilityRole="header">
          Visão geral
        </Texto>
        <Texto tom="secundaria">
          Olá, {dados.perfil.nome}. Acompanhe seu saldo e suas movimentações.
        </Texto>
      </View>

      {/* Cartão principal de saldo */}
      <Cartao style={estilos.cartaoDestaque}>
        <Texto variante="legenda" tom="secundaria">
          SALDO DISPONÍVEL
        </Texto>
        <Texto
          variante="valor"
          tom={resumo.saldoDisponivel >= 0 ? 'primaria' : 'perigo'}
          accessibilityRole="text">
          {formatarMoeda(resumo.saldoDisponivel)}
        </Texto>
        <Texto variante="legenda" tom="secundaria">
          Receitas recebidas menos despesas pagas
        </Texto>

        <View style={estilos.divisor} />

        <View style={estilos.linhaPrevisao}>
          <View>
            <Texto variante="legenda" tom="secundaria">
              Previsão após pendências
            </Texto>
            <Texto variante="subtitulo">
              {formatarMoeda(resumo.saldoPrevisto)}
            </Texto>
          </View>
          {resumo.despesasPendentes > 0 && (
            <View style={estilos.seloPendente}>
              <Texto variante="legenda" style={estilos.textoPendente}>
                {formatarMoeda(resumo.despesasPendentes)} a pagar
              </Texto>
            </View>
          )}
        </View>
      </Cartao>

      {/* Resumo de entradas e saídas */}
      <View style={estilos.gridMetricas}>
        <Cartao style={estilos.cartaoMetrica}>
          <Texto variante="legenda" tom="secundaria">
            RECEITAS RECEBIDAS
          </Texto>
          <Texto variante="subtitulo" tom="primaria">
            {formatarMoeda(resumo.receitasRecebidas)}
          </Texto>
          <Texto variante="legenda" tom="secundaria">
            Entradas quitadas
          </Texto>
        </Cartao>

        <Cartao style={estilos.cartaoMetrica}>
          <Texto variante="legenda" tom="secundaria">
            DESPESAS PAGAS
          </Texto>
          <Texto variante="subtitulo">
            {formatarMoeda(resumo.despesasPagas)}
          </Texto>
          <Texto variante="legenda" tom="secundaria">
            Saídas realizadas
          </Texto>
        </Cartao>
      </View>

      {/* Ação rápida para novo lançamento */}
      <Botao
        titulo="+ Novo lançamento"
        onPress={() => navegador.push('/novo-lancamento')}
      />

      {/* Gastos por categoria */}
      <Cartao>
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
                  <View style={estilos.trilhoBarra}>
                    <View style={[estilos.progressoBarra, { width: `${larguraBarra}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Cartao>

      {/* Últimos lançamentos */}
      <Cartao>
        <View style={estilos.cabecalhoSecao}>
          <Texto variante="subtitulo" accessibilityRole="header">
            Últimos lançamentos
          </Texto>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver receitas"
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
                    index > 0 && estilos.separadorLancamento,
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
                          <Texto variante="legenda" style={estilos.textoTagPendente}>
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

      <Botao
        titulo="Meu perfil"
        variante="secundaria"
        onPress={() => navegador.push('/perfil')}
      />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botaoPerfilTopo: {
    width: 40,
    height: 40,
    borderRadius: raios.capsula,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficieElevada,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cabecalho: {
    gap: espacamentos.minimo,
  },
  cartaoDestaque: {
    borderColor: cores.borda,
    backgroundColor: cores.superficieElevada,
  },
  divisor: {
    height: 1,
    backgroundColor: cores.borda,
    marginVertical: espacamentos.pequeno,
  },
  linhaPrevisao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seloPendente: {
    paddingHorizontal: espacamentos.medio,
    paddingVertical: espacamentos.minimo,
    borderRadius: raios.capsula,
    backgroundColor: 'rgba(249, 156, 0, 0.12)',
  },
  textoPendente: {
    color: cores.aviso,
    fontWeight: '600',
  },
  gridMetricas: {
    flexDirection: 'row',
    gap: espacamentos.medio,
  },
  cartaoMetrica: {
    flex: 1,
    padding: espacamentos.grande,
    gap: espacamentos.minimo,
  },
  cabecalhoSecao: {
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
    backgroundColor: cores.superficieElevada,
    overflow: 'hidden',
  },
  progressoBarra: {
    height: '100%',
    borderRadius: raios.capsula,
    backgroundColor: cores.primaria,
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
    borderTopColor: cores.borda,
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
    color: cores.aviso,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
  },
  valorLancamento: {
    fontWeight: '700',
  },
});
