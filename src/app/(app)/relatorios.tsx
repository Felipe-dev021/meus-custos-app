import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { CabecalhoNavegacao } from '@/componentes/CabecalhoNavegacao';
import { Cartao } from '@/componentes/Cartao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import {
  formatarTextoRelatorio,
  gerarRelatorioFinanceiro,
  type ItemDistribuicaoCategoria,
} from '@/dominio/relatorios';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { espacamentos, raios } from '@/tema';
import { useTema } from '@/tema/ContextoTema';
import { formatarMoeda } from '@/utilitarios/formatacao';

export default function TelaRelatorios() {
  const { dados } = useFinanceiro();
  const { cores } = useTema();
  const [copiado, definirCopiado] = useState(false);

  const relatorio = gerarRelatorioFinanceiro(dados.lancamentos);

  function aoCopiarResumo() {
    const texto = formatarTextoRelatorio(relatorio);
    definirCopiado(true);
    Alert.alert('Resumo Copiado', 'O relatório foi compilado com sucesso:\n\n' + texto);
    setTimeout(() => definirCopiado(false), 2000);
  }

  const corSituacao =
    relatorio.situacao === 'positiva'
      ? cores.primaria
      : relatorio.situacao === 'atencao'
        ? cores.aviso
        : cores.perigo;

  const textoSituacao =
    relatorio.situacao === 'positiva'
      ? 'Saúde Financeira Positiva'
      : relatorio.situacao === 'atencao'
        ? 'Atenção ao Orçamento'
        : 'Déficit Financeiro';

  const descricaoSituacao =
    relatorio.situacao === 'positiva'
      ? 'Você está mantendo suas despesas abaixo das receitas e economizando parte da renda.'
      : relatorio.situacao === 'atencao'
        ? 'Mais de 85% das suas receitas estão comprometidas. Monitore novas despesas.'
        : 'Suas despesas superam os ganhos registrados. Reduza custos para equilibrar o saldo.';

  // Proporção de despesas em relação a receitas (máximo 100% para a barra visual)
  const percentualComprometimento =
    relatorio.totalReceitasCentavos > 0
      ? Math.min(Math.round((relatorio.totalDespesasPagasCentavos / relatorio.totalReceitasCentavos) * 100), 100)
      : relatorio.totalDespesasPagasCentavos > 0
        ? 100
        : 0;

  return (
    <Tela edges={['top', 'right', 'left']}>
      <CabecalhoNavegacao rotaAtiva="relatorios" />

      {/* Topo da Seção */}
      <View style={estilos.cabecalhoSecao}>
        <View style={estilos.textosTitulo}>
          <Texto variante="titulo" accessibilityRole="header">
            Relatórios & Balanço
          </Texto>
          <Texto tom="secundaria">
            Diagnóstico consolidado da sua saúde financeira.
          </Texto>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exportar resumo financeiro"
          onPress={aoCopiarResumo}
          style={[
            estilos.botaoCopiar,
            {
              backgroundColor: cores.superficieElevada,
              borderColor: cores.borda,
            },
          ]}>
          <Ionicons
            name={copiado ? 'checkmark-outline' : 'share-outline'}
            size={16}
            color={cores.primaria}
          />
          <Texto tom="primaria" style={estilos.textoBotaoCopiar}>
            {copiado ? 'Copiado!' : 'Exportar'}
          </Texto>
        </Pressable>
      </View>

      {/* Card de Diagnóstico Geral */}
      <Cartao style={estilos.cartaoDiagnostico}>
        <View style={estilos.topoDiagnostico}>
          <View
            style={[
              estilos.seloSituacao,
              {
                backgroundColor:
                  relatorio.situacao === 'positiva'
                    ? 'rgba(0, 255, 85, 0.12)'
                    : relatorio.situacao === 'atencao'
                      ? 'rgba(249, 156, 0, 0.12)'
                      : 'rgba(255, 93, 98, 0.12)',
                borderColor: corSituacao,
              },
            ]}>
            <View style={[estilos.pontoSelo, { backgroundColor: corSituacao }]} />
            <Texto
              variante="legenda"
              tom={relatorio.situacao === 'positiva' ? 'primaria' : relatorio.situacao === 'critica' ? 'perigo' : 'secundaria'}
              style={[estilos.textoSelo, { color: corSituacao }]}>
              DIAGNÓSTICO
            </Texto>
          </View>
          <Texto variante="subtitulo" style={[estilos.tituloDiagnostico, { color: corSituacao }]}>
            {textoSituacao}
          </Texto>
        </View>
        <Texto tom="secundaria">{descricaoSituacao}</Texto>
      </Cartao>

      {/* Grade de 4 Cartões de Métricas */}
      <View style={estilos.gradeMetricas}>
        <View style={estilos.linhaGrade}>
          <Cartao style={estilos.cartaoMetrica}>
            <View style={estilos.topoMetrica}>
              <Ionicons name="pie-chart-outline" size={18} color={cores.primaria} />
              <Texto variante="legenda" tom="secundaria">
                TAXA DE POUPANÇA
              </Texto>
            </View>
            <Texto variante="titulo" tom={relatorio.taxaEconomiaPercentual >= 0 ? 'primaria' : 'perigo'}>
              {relatorio.taxaEconomiaPercentual}%
            </Texto>
            <Texto variante="legenda" tom="secundaria">
              da renda preservada
            </Texto>
          </Cartao>

          <Cartao style={estilos.cartaoMetrica}>
            <View style={estilos.topoMetrica}>
              <Ionicons name="calculator-outline" size={18} color={cores.primaria} />
              <Texto variante="legenda" tom="secundaria">
                MÉDIA POR DESPESA
              </Texto>
            </View>
            <Texto variante="titulo">
              {formatarMoeda(relatorio.mediaPorDespesaCentavos)}
            </Texto>
            <Texto variante="legenda" tom="secundaria">
              custo médio unitário
            </Texto>
          </Cartao>
        </View>

        <View style={estilos.linhaGrade}>
          <Cartao style={estilos.cartaoMetrica}>
            <View style={estilos.topoMetrica}>
              <Ionicons name="trending-up-outline" size={18} color={cores.primaria} />
              <Texto variante="legenda" tom="secundaria">
                TOTAL DE ENTRADAS
              </Texto>
            </View>
            <Texto variante="subtitulo" tom="primaria">
              {formatarMoeda(relatorio.totalReceitasCentavos)}
            </Texto>
            <Texto variante="legenda" tom="secundaria">
              {relatorio.quantidadeReceitas} receitas registradas
            </Texto>
          </Cartao>

          <Cartao style={estilos.cartaoMetrica}>
            <View style={estilos.topoMetrica}>
              <Ionicons name="alert-circle-outline" size={18} color={cores.aviso} />
              <Texto variante="legenda" tom="secundaria">
                DESPESAS PENDENTES
              </Texto>
            </View>
            <Texto variante="subtitulo" style={{ color: cores.aviso }}>
              {formatarMoeda(relatorio.totalDespesasPendentesCentavos)}
            </Texto>
            <Texto variante="legenda" tom="secundaria">
              a vencer no período
            </Texto>
          </Cartao>
        </View>
      </View>

      {/* Gráfico Comparativo em Flexbox */}
      <Cartao style={estilos.cartaoGrafico}>
        <Texto variante="subtitulo" accessibilityRole="header">
          Comprometimento de Renda
        </Texto>
        <Texto tom="secundaria">
          Proporção de despesas pagas em relação ao total recebido.
        </Texto>

        <View style={estilos.containerBarraGrafico}>
          <View style={[estilos.fundoBarra, { backgroundColor: cores.superficieElevada }]}>
            <View
              style={[
                estilos.preenchimentoBarra,
                {
                  width: `${percentualComprometimento}%`,
                  backgroundColor: percentualComprometimento > 85 ? cores.perigo : cores.primaria,
                },
              ]}
            />
          </View>
          <View style={estilos.legendaBarra}>
            <Texto variante="legenda" tom="secundaria">
              0% (Livre)
            </Texto>
            <Texto variante="rotulo" tom={percentualComprometimento > 85 ? 'perigo' : 'primaria'}>
              {percentualComprometimento}% Comprometido
            </Texto>
            <Texto variante="legenda" tom="secundaria">
              100%
            </Texto>
          </View>
        </View>
      </Cartao>

      {/* Distribuição por Categorias */}
      <View style={estilos.secaoDistribuicao}>
        <Texto variante="rotulo" style={estilos.tituloDistribuicao}>
          DISTRIBUIÇÃO DE GASTOS POR CATEGORIA
        </Texto>

        {relatorio.distribuicaoCategorias.length === 0 ? (
          <Cartao>
            <Texto tom="secundaria">Nenhuma despesa paga registrada para exibir no gráfico.</Texto>
          </Cartao>
        ) : (
          relatorio.distribuicaoCategorias.map((cat: ItemDistribuicaoCategoria) => (
            <Cartao key={cat.categoria} style={estilos.cartaoCategoria}>
              <View style={estilos.linhaCategoriaTopo}>
                <Texto variante="rotulo">{cat.nomeCategoria}</Texto>
                <Texto variante="rotulo">{formatarMoeda(cat.totalCentavos)}</Texto>
              </View>

              <View style={[estilos.trilhoProgresso, { backgroundColor: cores.superficieElevada }]}>
                <View
                  style={[
                    estilos.progressoPreenchido,
                    {
                      width: `${Math.min(cat.porcentagem, 100)}%`,
                      backgroundColor: cores.primaria,
                    },
                  ]}
                />
              </View>

              <Texto variante="legenda" tom="secundaria" style={estilos.textoPorcentagem}>
                {cat.porcentagem}% do total de despesas pagas
              </Texto>
            </Cartao>
          ))
        )}
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  cabecalhoSecao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: espacamentos.medio,
    marginBottom: espacamentos.pequeno,
  },
  textosTitulo: {
    flex: 1,
    gap: espacamentos.minimo,
  },
  botaoCopiar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.minimo,
    paddingHorizontal: espacamentos.medio,
    paddingVertical: espacamentos.pequeno,
    borderRadius: raios.pequeno,
    borderWidth: 1,
  },
  textoBotaoCopiar: {
    fontSize: 13,
    fontWeight: '600',
  },
  cartaoDiagnostico: {
    gap: espacamentos.pequeno,
    marginBottom: espacamentos.grande,
  },
  topoDiagnostico: {
    gap: espacamentos.minimo,
  },
  seloSituacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.pequeno,
    paddingHorizontal: espacamentos.medio,
    paddingVertical: espacamentos.minimo / 2,
    borderRadius: raios.capsula,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pontoSelo: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  textoSelo: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tituloDiagnostico: {
    marginTop: espacamentos.minimo,
  },
  gradeMetricas: {
    gap: espacamentos.medio,
    marginBottom: espacamentos.grande,
  },
  linhaGrade: {
    flexDirection: 'row',
    gap: espacamentos.medio,
  },
  cartaoMetrica: {
    flex: 1,
    gap: espacamentos.minimo,
    padding: espacamentos.medio,
  },
  topoMetrica: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.pequeno,
  },
  cartaoGrafico: {
    gap: espacamentos.medio,
    marginBottom: espacamentos.grande,
  },
  containerBarraGrafico: {
    gap: espacamentos.pequeno,
    marginTop: espacamentos.minimo,
  },
  fundoBarra: {
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
  },
  preenchimentoBarra: {
    height: '100%',
    borderRadius: 7,
  },
  legendaBarra: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secaoDistribuicao: {
    gap: espacamentos.medio,
    marginBottom: espacamentos.amplo,
  },
  tituloDistribuicao: {
    letterSpacing: 0.5,
  },
  cartaoCategoria: {
    gap: espacamentos.pequeno,
  },
  linhaCategoriaTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trilhoProgresso: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressoPreenchido: {
    height: '100%',
    borderRadius: 4,
  },
  textoPorcentagem: {
    textAlign: 'right',
  },
});
