import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Botao } from '@/componentes/Botao';
import { CabecalhoNavegacao } from '@/componentes/CabecalhoNavegacao';
import { Cartao } from '@/componentes/Cartao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import { categoriasDespesa } from '@/dominio/categorias';
import type { Divida, Parcela } from '@/dominio/financeiro';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { espacamentos, raios } from '@/tema';
import { useTema } from '@/tema/ContextoTema';
import { formatarData, formatarMoeda, paraDataCivil } from '@/utilitarios/formatacao';

type ParcelaSelecionada = {
  divida: Divida;
  parcela: Parcela;
} | null;

export default function TelaDividas() {
  const { dados, resumoDividas, executar, salvando } = useFinanceiro();
  const { cores } = useTema();

  const [parcelaParaPagar, definirParcelaParaPagar] = useState<ParcelaSelecionada>(null);
  const [erroPagamento, definirErroPagamento] = useState<string | null>(null);

  function abrirConfirmacaoPagamento(divida: Divida, parcela: Parcela) {
    if (parcela.situacao === 'paga') return;

    // Calcula saldo restante da dívida
    const valorRestante = divida.parcelas
      .filter((p) => p.situacao === 'pendente')
      .reduce((soma, p) => soma + p.valorCentavos, 0);

    // Validação impedindo pagamento acima do saldo restante
    if (parcela.valorCentavos > valorRestante) {
      definirErroPagamento('O valor da parcela ultrapassa o saldo devedor restante.');
      return;
    }

    definirErroPagamento(null);
    definirParcelaParaPagar({ divida, parcela });
  }

  function confirmarPagamento() {
    if (!parcelaParaPagar) return;

    const hoje = paraDataCivil(new Date());

    try {
      executar({
        tipo: 'pagar-parcela',
        dividaId: parcelaParaPagar.divida.id,
        parcelaId: parcelaParaPagar.parcela.id,
        dataPagamento: hoje,
        hoje,
      });
      definirParcelaParaPagar(null);
    } catch (err: any) {
      definirErroPagamento(err?.message ?? 'Não foi possível processar o pagamento.');
    }
  }

  return (
    <Tela edges={['top', 'right', 'left']}>
      {/* Topo unificado com Logo e Menu Hambúrguer */}
      <CabecalhoNavegacao rotaAtiva="dividas" />

      {/* Título da Tela */}
      <View style={estilos.cabecalhoSecao}>
        <View style={estilos.textosTitulo}>
          <Texto variante="titulo" accessibilityRole="header">
            Dívidas e Parcelamentos
          </Texto>
          <Texto tom="secundaria">
            Acompanhe suas pendências financeiras e quite parcelas
          </Texto>
        </View>
      </View>

      {/* Grade de Métricas do Saldo Devedor */}
      <View style={estilos.gradeMetricas}>
        <View style={estilos.linhaMetricas}>
          {/* Card 1: Saldo Devedor Total */}
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
                name="business-outline"
                size={18}
                color={resumoDividas.saldoDevedorTotal > 0 ? cores.perigo : cores.primaria}
              />
            </View>
            <Texto variante="legenda" tom="secundaria">Saldo devedor total</Texto>
            <Texto
              variante="subtitulo"
              tom={resumoDividas.saldoDevedorTotal > 0 ? 'perigo' : 'primaria'}
              numberOfLines={1}
              style={estilos.valorMetrica}>
              {formatarMoeda(resumoDividas.saldoDevedorTotal)}
            </Texto>
          </Cartao>

          {/* Card 2: Total já pago */}
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
            <Texto variante="legenda" tom="secundaria">Total já pago</Texto>
            <Texto
              variante="subtitulo"
              tom="primaria"
              numberOfLines={1}
              style={estilos.valorMetrica}>
              {formatarMoeda(resumoDividas.totalPago)}
            </Texto>
          </Cartao>
        </View>

        {/* Card 3: Dívidas quitadas */}
        <Cartao
          style={[
            estilos.cartaoMetricaUnico,
            {
              backgroundColor: cores.cartaoMetrica,
              borderColor: cores.borda,
            },
          ]}>
          <View style={[estilos.iconeCaixa, { backgroundColor: cores.iconeCaixa }]}>
            <Ionicons name="pie-chart-outline" size={18} color={cores.texto} />
          </View>
          <Texto variante="legenda" tom="secundaria">Dívidas quitadas</Texto>
          <Texto
            variante="subtitulo"
            numberOfLines={1}
            style={[estilos.valorMetrica, { color: cores.texto }]}>
            {`${resumoDividas.quantidadeQuitadas} de ${resumoDividas.quantidadeDividas} concluídas`}
          </Texto>
        </Cartao>
      </View>

      {/* Lista de Dívidas */}
      {dados.dividas.length === 0 ? (
        <Cartao
          style={[
            estilos.cartaoVazio,
            {
              backgroundColor: cores.cartaoMetrica,
              borderColor: cores.borda,
            },
          ]}>
          <Texto variante="rotulo" tom="primaria">
            Parabéns!
          </Texto>
          <Texto tom="secundaria">
            Você não possui dívidas ou parcelamentos cadastrados no momento.
          </Texto>
        </Cartao>
      ) : (
        <View style={estilos.listaDividas}>
          {dados.dividas.map((divida) => {
            const totalDivida = divida.parcelas.reduce(
              (total, p) => total + p.valorCentavos,
              0,
            );
            const totalPago = divida.parcelas
              .filter((p) => p.situacao === 'paga')
              .reduce((total, p) => total + p.valorCentavos, 0);
            const valorRestante = totalDivida - totalPago;
            const quitada = valorRestante === 0 && divida.parcelas.length > 0;
            const porcentagemPaga =
              totalDivida > 0 ? Math.round((totalPago / totalDivida) * 100) : 100;

            return (
              <Cartao
                key={divida.id}
                style={[
                  estilos.cartaoDivida,
                  {
                    backgroundColor: cores.cartaoMetrica,
                    borderColor: quitada ? cores.primaria : cores.borda,
                  },
                ]}>
                {/* Topo do Cartão de Dívida */}
                <View style={estilos.topoDivida}>
                  <View style={estilos.infoTituloDivida}>
                    <Texto variante="subtitulo" style={estilos.tituloDivida}>
                      {divida.descricao}
                    </Texto>
                    <View
                      style={[
                        estilos.tagCategoria,
                        {
                          backgroundColor: cores.tagPill,
                          borderColor: cores.borda,
                        },
                      ]}>
                      <Texto variante="legenda" tom="secundaria" style={estilos.textoCategoria}>
                        {categoriasDespesa[divida.categoria] ?? divida.categoria}
                      </Texto>
                    </View>
                  </View>

                  {/* Badge de Situação da Dívida */}
                  <View
                    style={[
                      estilos.badgeSituacaoDivida,
                      quitada
                        ? {
                            backgroundColor: 'rgba(0, 255, 85, 0.1)',
                            borderColor: 'rgba(0, 255, 85, 0.3)',
                          }
                        : {
                            backgroundColor: 'rgba(249, 156, 0, 0.12)',
                            borderColor: 'rgba(249, 156, 0, 0.3)',
                          },
                    ]}>
                      {quitada && (
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={12}
                          color={cores.primaria}
                        />
                      )}
                      <Texto
                        variante="legenda"
                        style={[
                          estilos.textoBadgeDivida,
                          { color: quitada ? cores.primaria : cores.aviso },
                        ]}>
                        {quitada ? 'QUITADA' : `${porcentagemPaga}% PAGO`}
                      </Texto>
                    </View>
                </View>

                {/* Resumo de Valores */}
                <View style={estilos.linhaValoresDivida}>
                  <View style={estilos.itemValor}>
                    <Texto variante="legenda" tom="secundaria">
                      Valor total
                    </Texto>
                    <Texto variante="rotulo">
                      {formatarMoeda(totalDivida)}
                    </Texto>
                  </View>

                  <View style={estilos.itemValor}>
                    <Texto variante="legenda" tom="secundaria">
                      Total pago
                    </Texto>
                    <Texto variante="rotulo" tom="primaria">
                      {formatarMoeda(totalPago)}
                    </Texto>
                  </View>

                  <View style={estilos.itemValor}>
                    <Texto variante="legenda" tom="secundaria">
                      Restante
                    </Texto>
                    <Texto
                      variante="rotulo"
                      tom={valorRestante > 0 ? 'perigo' : 'padrao'}>
                      {formatarMoeda(valorRestante)}
                    </Texto>
                  </View>
                </View>

                {/* Barra de Progresso Visual */}
                <View style={estilos.secaoProgresso}>
                  <View style={[estilos.trilhoProgresso, { backgroundColor: cores.superficieElevada }]}>
                    <View
                      style={[
                        estilos.barraProgresso,
                        {
                          width: `${porcentagemPaga}%`,
                          backgroundColor: cores.primaria,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Linha Divisora */}
                <View style={[estilos.divisor, { backgroundColor: cores.borda }]} />

                {/* Lista de Parcelas */}
                <View style={estilos.secaoParcelas}>
                  <Texto variante="rotulo" style={estilos.tituloParcelas}>
                    Parcelas ({divida.parcelas.length})
                  </Texto>

                  <View style={estilos.listaParcelas}>
                    {divida.parcelas.map((parcela) => {
                      const estaPaga = parcela.situacao === 'paga';

                      return (
                        <View
                          key={parcela.id}
                          style={[
                            estilos.linhaParcela,
                            {
                              backgroundColor: cores.superficieElevada,
                              borderColor: estaPaga ? 'rgba(0, 255, 85, 0.2)' : cores.borda,
                            },
                          ]}>
                          <View style={estilos.infoParcela}>
                            <Texto variante="rotulo">
                              {`Parcela ${parcela.numero} de ${divida.parcelas.length}`}
                            </Texto>
                            <Texto variante="legenda" tom="secundaria">
                              {estaPaga
                                ? `Pago em ${formatarData(parcela.dataPagamento)}`
                                : `Vence em ${formatarData(parcela.dataVencimento)}`}
                            </Texto>
                          </View>

                          <View style={estilos.acaoParcela}>
                            <Texto
                              variante="rotulo"
                              tom={estaPaga ? 'primaria' : 'padrao'}
                              style={estilos.valorParcela}>
                              {formatarMoeda(parcela.valorCentavos)}
                            </Texto>

                            {estaPaga ? (
                              <View
                                  style={[
                                    estilos.badgeParcelaPaga,
                                    {
                                      backgroundColor: 'rgba(0, 255, 85, 0.1)',
                                      borderColor: 'rgba(0, 255, 85, 0.3)',
                                    },
                                  ]}>
                                  <Ionicons
                                    name="checkmark-circle-outline"
                                    size={12}
                                    color={cores.primaria}
                                  />
                                  <Texto
                                    variante="legenda"
                                    style={[estilos.textoParcelaPaga, { color: cores.primaria }]}>
                                    Paga
                                  </Texto>
                                </View>
                            ) : (
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Pagar parcela ${parcela.numero}`}
                                onPress={() => abrirConfirmacaoPagamento(divida, parcela)}
                                style={[
                                  estilos.botaoPagarParcela,
                                  { backgroundColor: cores.primaria },
                                ]}>
                                <Texto
                                  variante="rotulo"
                                  style={[
                                    estilos.textoBotaoPagar,
                                    { color: cores.sobrePrimaria },
                                  ]}>
                                  Pagar
                                </Texto>
                              </Pressable>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </Cartao>
            );
          })}
        </View>
      )}

      {/* Modal de Confirmação de Pagamento Simulado */}
      <Modal
        visible={parcelaParaPagar !== null}
        transparent
        animationType="fade"
        onRequestClose={() => definirParcelaParaPagar(null)}>
        <View style={[estilos.fundoModal, { backgroundColor: cores.fundoModal }]}>
          <Pressable
            accessibilityLabel="Fechar modal"
            onPress={() => definirParcelaParaPagar(null)}
            style={estilos.fecharFora}
          />

          <View
            style={[
              estilos.painelConfirmacao,
              {
                backgroundColor: cores.superficie,
                borderColor: cores.borda,
              },
            ]}>
            <Texto variante="subtitulo" accessibilityRole="header">
              Confirmar Pagamento
            </Texto>

            <Texto tom="secundaria">
              {`Deseja simular o pagamento da Parcela ${parcelaParaPagar?.parcela.numero} de ${parcelaParaPagar?.divida.descricao}?`}
            </Texto>

            <View style={[estilos.caixaResumoPagamento, { backgroundColor: cores.superficieElevada }]}>
              <View style={estilos.linhaResumoModal}>
                <Texto variante="legenda" tom="secundaria">Dívida:</Texto>
                <Texto variante="rotulo">{parcelaParaPagar?.divida.descricao}</Texto>
              </View>

              <View style={estilos.linhaResumoModal}>
                <Texto variante="legenda" tom="secundaria">Parcela:</Texto>
                <Texto variante="rotulo">
                  {`${parcelaParaPagar?.parcela.numero} de ${parcelaParaPagar?.divida.parcelas.length}`}
                </Texto>
              </View>

              <View style={estilos.linhaResumoModal}>
                <Texto variante="legenda" tom="secundaria">Valor a pagar:</Texto>
                <Texto variante="rotulo" tom="primaria">
                  {formatarMoeda(parcelaParaPagar?.parcela.valorCentavos ?? 0)}
                </Texto>
              </View>

              <View style={estilos.linhaResumoModal}>
                <Texto variante="legenda" tom="secundaria">Data do pagamento:</Texto>
                <Texto variante="rotulo">
                  {formatarData(paraDataCivil(new Date()))}
                </Texto>
              </View>
            </View>

            <Texto variante="legenda" tom="secundaria" style={estilos.avisoModal}>
              ℹ Este pagamento será registrado automaticamente como uma despesa paga, atualizando seu saldo disponível.
            </Texto>

            {erroPagamento && (
              <Texto variante="legenda" tom="perigo">
                {erroPagamento}
              </Texto>
            )}

            <View style={estilos.botoesModal}>
              <Botao
                titulo="Cancelar"
                variante="secundaria"
                onPress={() => definirParcelaParaPagar(null)}
                style={estilos.botaoModalAcao}
              />
              <Botao
                titulo="Confirmar"
                variante="primaria"
                carregando={salvando}
                onPress={confirmarPagamento}
                style={estilos.botaoModalAcao}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  cartaoVazio: {
    padding: espacamentos.grande,
    alignItems: 'center',
    gap: espacamentos.pequeno,
  },
  listaDividas: {
    gap: espacamentos.grande,
  },
  cartaoDivida: {
    gap: espacamentos.grande,
    padding: espacamentos.grande,
  },
  topoDivida: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: espacamentos.medio,
  },
  infoTituloDivida: {
    flex: 1,
    gap: espacamentos.minimo,
  },
  tituloDivida: {
    fontSize: 18,
    lineHeight: 24,
  },
  tagCategoria: {
    alignSelf: 'flex-start',
    paddingHorizontal: espacamentos.medio,
    paddingVertical: 2,
    borderRadius: raios.capsula,
    borderWidth: 1,
    marginTop: 2,
  },
  textoCategoria: {
    fontSize: 11,
  },
  badgeSituacaoDivida: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: espacamentos.medio,
    paddingVertical: 4,
    borderRadius: raios.pequeno,
    borderWidth: 1,
  },
  textoBadgeDivida: {
    fontWeight: '700',
    fontSize: 11,
  },
  linhaValoresDivida: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: espacamentos.pequeno,
  },
  itemValor: {
    flex: 1,
    gap: 2,
  },
  secaoProgresso: {
    gap: espacamentos.minimo,
  },
  trilhoProgresso: {
    height: 8,
    borderRadius: raios.capsula,
    overflow: 'hidden',
  },
  barraProgresso: {
    height: '100%',
    borderRadius: raios.capsula,
  },
  divisor: {
    height: 1,
  },
  secaoParcelas: {
    gap: espacamentos.medio,
  },
  tituloParcelas: {
    fontSize: 15,
  },
  listaParcelas: {
    gap: espacamentos.pequeno,
  },
  linhaParcela: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: espacamentos.medio,
    borderRadius: raios.pequeno,
    borderWidth: 1,
  },
  infoParcela: {
    flex: 1,
    gap: 2,
  },
  acaoParcela: {
    alignItems: 'flex-end',
    gap: 4,
  },
  valorParcela: {
    fontSize: 14,
  },
  badgeParcelaPaga: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: raios.pequeno,
    borderWidth: 1,
  },
  textoParcelaPaga: {
    fontSize: 11,
    fontWeight: '700',
  },
  botaoPagarParcela: {
    paddingHorizontal: espacamentos.medio,
    paddingVertical: 4,
    borderRadius: raios.pequeno,
  },
  textoBotaoPagar: {
    fontSize: 12,
    fontWeight: '700',
  },
  fundoModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: espacamentos.grande,
  },
  fecharFora: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  painelConfirmacao: {
    width: '100%',
    maxWidth: 480,
    padding: espacamentos.extraGrande,
    borderRadius: raios.medio,
    borderWidth: 1,
    gap: espacamentos.grande,
  },
  caixaResumoPagamento: {
    padding: espacamentos.grande,
    borderRadius: raios.pequeno,
    gap: espacamentos.pequeno,
  },
  linhaResumoModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avisoModal: {
    lineHeight: 18,
  },
  botoesModal: {
    flexDirection: 'row',
    gap: espacamentos.medio,
    marginTop: espacamentos.pequeno,
  },
  botaoModalAcao: {
    flex: 1,
  },
});
