import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Botao } from '@/componentes/Botao';
import { CabecalhoNavegacao } from '@/componentes/CabecalhoNavegacao';
import { Cartao } from '@/componentes/Cartao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import {
  buscarCotacoesMoedas,
  converterReaisParaMoeda,
  ItemCotacao,
  RespostaCotacoes,
} from '@/servicos/apiCotacoes';
import { espacamentos, raios } from '@/tema';
import { useTema } from '@/tema/ContextoTema';
import { formatarMoeda } from '@/utilitarios/formatacao';

export default function TelaCotacoes() {
  const { resumo } = useFinanceiro();
  const { cores } = useTema();

  const [dadosCotacoes, definirDadosCotacoes] = useState<RespostaCotacoes | null>(null);
  const [carregando, definirCarregando] = useState(true);
  const [recarregando, definirRecarregando] = useState(false);
  const [valorSimulacao, definirValorSimulacao] = useState('100');
  const [moedaSimulacao, definirMoedaSimulacao] = useState<'USD' | 'EUR'>('USD');

  async function carregarDados() {
    definirRecarregando(true);
    try {
      const res = await buscarCotacoesMoedas();
      definirDadosCotacoes(res);
    } finally {
      definirCarregando(false);
      definirRecarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  const cotacaoDolar = dadosCotacoes?.cotacoes.find((c) => c.codigo === 'USD')?.valorCompra ?? 5.85;
  const cotacaoEuro = dadosCotacoes?.cotacoes.find((c) => c.codigo === 'EUR')?.valorCompra ?? 6.20;

  const saldoEmDolar = converterReaisParaMoeda(resumo.saldoDisponivel, cotacaoDolar);
  const saldoEmEuro = converterReaisParaMoeda(resumo.saldoDisponivel, cotacaoEuro);

  const valorNumericoSimulacao = parseFloat(valorSimulacao.replace(',', '.')) || 0;
  const cotacaoEscolhida = moedaSimulacao === 'USD' ? cotacaoDolar : cotacaoEuro;
  const resultadoSimulacaoEmReais = valorNumericoSimulacao * cotacaoEscolhida;

  return (
    <Tela edges={['top', 'right', 'left']}>
      <CabecalhoNavegacao rotaAtiva="cotacoes" />

      {/* Cabeçalho da Seção */}
      <View style={estilos.cabecalhoSecao}>
        <View style={estilos.textosTitulo}>
          <Texto variante="titulo" accessibilityRole="header">
            Câmbio & Cotações
          </Texto>
          <Texto tom="secundaria">
            Taxas de mercado ao vivo com dados públicos da AwesomeAPI.
          </Texto>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Atualizar cotações"
          disabled={recarregando}
          onPress={carregarDados}
          style={[estilos.botaoRecarregar, { borderColor: cores.borda, backgroundColor: cores.superficieElevada }]}>
          {recarregando ? (
            <ActivityIndicator size="small" color={cores.primaria} />
          ) : (
            <>
              <Ionicons name="refresh-outline" size={16} color={cores.primaria} />
              <Texto tom="primaria" style={estilos.textoRecarregar}>
                Atualizar
              </Texto>
            </>
          )}
        </Pressable>
      </View>

      {/* Selo de Status da API */}
      <View style={estilos.linhaStatus}>
        <View
          style={[
            estilos.badgeStatus,
            {
              backgroundColor: dadosCotacoes?.origem === 'online' ? 'rgba(0, 255, 85, 0.12)' : 'rgba(249, 156, 0, 0.12)',
              borderColor: dadosCotacoes?.origem === 'online' ? cores.primaria : cores.aviso,
            },
          ]}>
          <View
            style={[
              estilos.pontoStatus,
              { backgroundColor: dadosCotacoes?.origem === 'online' ? cores.primaria : cores.aviso },
            ]}
          />
          <Texto
            variante="legenda"
            tom={dadosCotacoes?.origem === 'online' ? 'primaria' : 'secundaria'}
            style={[estilos.textoStatus, dadosCotacoes?.origem !== 'online' && { color: cores.aviso }]}>
            {dadosCotacoes?.origem === 'online'
              ? `ONLINE • Atualizado às ${dadosCotacoes.dataHora}`
              : `CACHE OFFLINE • Armazenamento local`}
          </Texto>
        </View>
      </View>

      {carregando ? (
        <View style={estilos.carregandoContainer}>
          <ActivityIndicator size="large" color={cores.primaria} />
          <Texto tom="secundaria">Consultando cotações em tempo real...</Texto>
        </View>
      ) : (
        <>
          {/* Card: Saldo Internacional */}
          <Cartao style={estilos.cartaoSaldoInternacional}>
            <View style={estilos.topoSaldoInternacional}>
              <View style={[estilos.iconeDestaque, { backgroundColor: cores.primariaSuave }]}>
                <Ionicons name="globe-outline" size={20} color={cores.primaria} />
              </View>
              <View style={estilos.infoSaldo}>
                <Texto variante="legenda" tom="secundaria">
                  SEU SALDO EM OUTRAS MOEDAS
                </Texto>
                <Texto variante="rotulo">{formatarMoeda(resumo.saldoDisponivel)}</Texto>
              </View>
            </View>

            <View style={estilos.gradeConversoes}>
              <View style={[estilos.itemConversao, { backgroundColor: cores.superficieElevada, borderColor: cores.borda }]}>
                <Texto variante="legenda" tom="secundaria">
                  Equivalente em Dólar
                </Texto>
                <Texto
                  variante="subtitulo"
                  tom="primaria"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                  style={estilos.valorConversao}>
                  US$ {saldoEmDolar.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Texto>
                <Texto variante="legenda" tom="secundaria">
                  Taxa: R$ {cotacaoDolar.toFixed(2)}
                </Texto>
              </View>

              <View style={[estilos.itemConversao, { backgroundColor: cores.superficieElevada, borderColor: cores.borda }]}>
                <Texto variante="legenda" tom="secundaria">
                  Equivalente em Euro
                </Texto>
                <Texto
                  variante="subtitulo"
                  tom="primaria"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                  style={estilos.valorConversao}>
                  € {saldoEmEuro.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Texto>
                <Texto variante="legenda" tom="secundaria">
                  Taxa: R$ {cotacaoEuro.toFixed(2)}
                </Texto>
              </View>
            </View>
          </Cartao>

          {/* Lista de Moedas da API */}
          <View style={estilos.secaoMoedas}>
            <Texto variante="rotulo" style={estilos.tituloLista}>
              Cotações Comerciais (BRL)
            </Texto>

            {dadosCotacoes?.cotacoes.map((item: ItemCotacao) => {
              const ehAlta = item.variacaoPercentual >= 0;
              return (
                <Cartao key={item.codigo} style={estilos.cartaoMoeda}>
                  <View style={estilos.linhaMoedaTopo}>
                    <View style={estilos.colunaIdentificacao}>
                      <View style={[estilos.avatarMoeda, { backgroundColor: cores.superficieElevada }]}>
                        <Texto variante="rotulo" tom="primaria">
                          {item.codigo}
                        </Texto>
                      </View>
                      <View>
                        <Texto variante="rotulo">{item.nome}</Texto>
                        <Texto variante="legenda" tom="secundaria">
                          {item.codigo} / {item.codigoPara}
                        </Texto>
                      </View>
                    </View>

                    <View style={estilos.colunaValor}>
                      <Texto variante="subtitulo" style={estilos.valorMoeda}>
                        {item.codigo === 'BTC'
                          ? `R$ ${item.valorCompra.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
                          : `R$ ${item.valorCompra.toFixed(2)}`}
                      </Texto>
                      <View
                        style={[
                          estilos.badgeVariacao,
                          {
                            backgroundColor: ehAlta ? 'rgba(0, 255, 85, 0.1)' : 'rgba(255, 93, 98, 0.1)',
                          },
                        ]}>
                        <Ionicons
                          name={ehAlta ? 'arrow-up-outline' : 'arrow-down-outline'}
                          size={12}
                          color={ehAlta ? cores.primaria : cores.perigo}
                        />
                        <Texto
                          variante="legenda"
                          tom={ehAlta ? 'primaria' : 'perigo'}
                          style={estilos.textoVariacao}>
                          {ehAlta ? '+' : ''}
                          {item.variacaoPercentual.toFixed(2)}%
                        </Texto>
                      </View>
                    </View>
                  </View>

                  <View style={[estilos.rodapeMoeda, { borderTopColor: cores.borda }]}>
                    <Texto variante="legenda" tom="secundaria">
                      Mín: R$ {item.minima < 1000 ? item.minima.toFixed(2) : item.minima.toLocaleString('pt-BR')}
                    </Texto>
                    <Texto variante="legenda" tom="secundaria">
                      Máx: R$ {item.maxima < 1000 ? item.maxima.toFixed(2) : item.maxima.toLocaleString('pt-BR')}
                    </Texto>
                  </View>
                </Cartao>
              );
            })}
          </View>

          {/* Conversor / Simulador de Câmbio Interativo */}
          <Cartao style={estilos.cartaoSimulador}>
            <Texto variante="subtitulo" accessibilityRole="header">
              Simulador de Câmbio
            </Texto>
            <Texto tom="secundaria">
              Descubra quanto você precisa em Reais (BRL) para adquirir moeda estrangeira.
            </Texto>

            <View style={estilos.seletorMoedaSimulador}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Selecionar Dólar"
                onPress={() => definirMoedaSimulacao('USD')}
                style={[
                  estilos.botaoAbaMoeda,
                  moedaSimulacao === 'USD' && { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
                ]}>
                <Texto tom={moedaSimulacao === 'USD' ? 'primaria' : 'secundaria'} style={estilos.textoAbaMoeda}>
                  💵 Dólar (USD)
                </Texto>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Selecionar Euro"
                onPress={() => definirMoedaSimulacao('EUR')}
                style={[
                  estilos.botaoAbaMoeda,
                  moedaSimulacao === 'EUR' && { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
                ]}>
                <Texto tom={moedaSimulacao === 'EUR' ? 'primaria' : 'secundaria'} style={estilos.textoAbaMoeda}>
                  💶 Euro (EUR)
                </Texto>
              </Pressable>
            </View>

            <View style={estilos.campoSimulador}>
              <Texto variante="legenda" tom="secundaria">
                Quantidade desejada ({moedaSimulacao}):
              </Texto>
              <TextInput
                keyboardType="numeric"
                value={valorSimulacao}
                onChangeText={definirValorSimulacao}
                placeholder="100"
                placeholderTextColor={cores.textoSecundario}
                style={[
                  estilos.inputSimulador,
                  { backgroundColor: cores.superficieElevada, borderColor: cores.borda, color: cores.texto },
                ]}
              />
            </View>

            <View style={[estilos.caixaResultado, { backgroundColor: cores.superficieElevada, borderColor: cores.borda }]}>
              <Texto variante="legenda" tom="secundaria">
                Custo estimado em Reais:
              </Texto>
              <Texto variante="titulo" tom="primaria" style={estilos.valorResultado}>
                R$ {resultadoSimulacaoEmReais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Texto>
              <Texto variante="legenda" tom="secundaria">
                Baseado na cotação de compra de R$ {cotacaoEscolhida.toFixed(2)}
              </Texto>
            </View>
          </Cartao>
        </>
      )}
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
  botaoRecarregar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.minimo,
    paddingHorizontal: espacamentos.medio,
    paddingVertical: espacamentos.pequeno,
    borderRadius: raios.pequeno,
    borderWidth: 1,
  },
  textoRecarregar: {
    fontSize: 13,
    fontWeight: '600',
  },
  linhaStatus: {
    marginBottom: espacamentos.medio,
  },
  badgeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.pequeno,
    paddingHorizontal: espacamentos.medio,
    paddingVertical: espacamentos.minimo,
    borderRadius: raios.capsula,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pontoStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  textoStatus: {
    fontWeight: '600',
  },
  carregandoContainer: {
    paddingVertical: espacamentos.amplo,
    alignItems: 'center',
    gap: espacamentos.medio,
  },
  cartaoSaldoInternacional: {
    gap: espacamentos.medio,
    marginBottom: espacamentos.grande,
  },
  topoSaldoInternacional: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.medio,
  },
  iconeDestaque: {
    width: 40,
    height: 40,
    borderRadius: raios.pequeno,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSaldo: {
    gap: 2,
  },
  gradeConversoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamentos.medio,
  },
  itemConversao: {
    flex: 1,
    minWidth: 130,
    padding: espacamentos.medio,
    borderRadius: raios.pequeno,
    borderWidth: 1,
    gap: 4,
  },
  valorConversao: {
    fontWeight: '700',
  },
  secaoMoedas: {
    gap: espacamentos.medio,
    marginBottom: espacamentos.grande,
  },
  tituloLista: {
    letterSpacing: 0.5,
  },
  cartaoMoeda: {
    gap: espacamentos.pequeno,
  },
  linhaMoedaTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colunaIdentificacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.medio,
  },
  avatarMoeda: {
    width: 44,
    height: 44,
    borderRadius: raios.pequeno,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colunaValor: {
    alignItems: 'flex-end',
    gap: 2,
  },
  valorMoeda: {
    fontWeight: '700',
  },
  badgeVariacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: raios.capsula,
  },
  textoVariacao: {
    fontSize: 11,
    fontWeight: '700',
  },
  rodapeMoeda: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: espacamentos.pequeno,
    marginTop: espacamentos.minimo,
  },
  cartaoSimulador: {
    gap: espacamentos.medio,
    marginBottom: espacamentos.amplo,
  },
  seletorMoedaSimulador: {
    flexDirection: 'row',
    gap: espacamentos.medio,
  },
  botaoAbaMoeda: {
    flex: 1,
    paddingVertical: espacamentos.pequeno,
    alignItems: 'center',
    borderRadius: raios.pequeno,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textoAbaMoeda: {
    fontWeight: '600',
  },
  campoSimulador: {
    gap: espacamentos.minimo,
  },
  inputSimulador: {
    height: 46,
    borderWidth: 1,
    borderRadius: raios.pequeno,
    paddingHorizontal: espacamentos.medio,
    fontSize: 16,
    fontWeight: '600',
  },
  caixaResultado: {
    padding: espacamentos.medio,
    borderRadius: raios.pequeno,
    borderWidth: 1,
    gap: 4,
  },
  valorResultado: {
    fontWeight: '800',
  },
});
