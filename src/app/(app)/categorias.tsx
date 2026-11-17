import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Botao } from '@/componentes/Botao';
import { CabecalhoNavegacao } from '@/componentes/CabecalhoNavegacao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Cartao } from '@/componentes/Cartao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import type { CategoriaDespesa } from '@/dominio/financeiro';
import {
  CHAVE_STORAGE_ORCAMENTOS,
  LIMITES_PADRAO_CATEGORIAS,
  calcularStatusOrcamentos,
  type StatusOrcamento,
} from '@/dominio/orcamentos';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { espacamentos, raios } from '@/tema';
import { useTema } from '@/tema/ContextoTema';
import { formatarMoeda } from '@/utilitarios/formatacao';

const ICONES_CATEGORIAS: Record<CategoriaDespesa, keyof typeof Ionicons.glyphMap> = {
  moradia: 'home-outline',
  alimentacao: 'restaurant-outline',
  transporte: 'car-outline',
  saude: 'medkit-outline',
  educacao: 'school-outline',
  lazer: 'game-controller-outline',
  compras: 'cart-outline',
  servicos: 'construct-outline',
  'outras-despesas': 'ellipsis-horizontal-circle-outline',
};

export default function TelaCategorias() {
  const { dados } = useFinanceiro();
  const { cores } = useTema();

  const [limites, definirLimites] = useState<Partial<Record<CategoriaDespesa, number>>>({});
  const [carregandoLimites, definirCarregandoLimites] = useState(true);

  // Estado do Modal de Edição de Limite
  const [categoriaEditando, definirCategoriaEditando] = useState<StatusOrcamento | null>(null);
  const [valorInput, definirValorInput] = useState('');
  const [erroModal, definirErroModal] = useState<string | null>(null);

  // Carrega orçamentos salvos do AsyncStorage
  useEffect(() => {
    async function carregarLimitesSalvos() {
      try {
        const salvos = await AsyncStorage.getItem(CHAVE_STORAGE_ORCAMENTOS);
        if (salvos) {
          definirLimites(JSON.parse(salvos));
        }
      } catch (err) {
        console.warn('Erro ao carregar orçamentos do storage:', err);
      } finally {
        definirCarregandoLimites(false);
      }
    }
    carregarLimitesSalvos();
  }, []);

  const resumo = calcularStatusOrcamentos(dados.lancamentos, limites);

  // Percentual geral de comprometimento do orçamento total
  const percentualGeral =
    resumo.totalOrcadoCentavos > 0
      ? Math.min(Math.round((resumo.totalGastoCentavos / resumo.totalOrcadoCentavos) * 100), 100)
      : 0;

  function abrirModalEdicao(item: StatusOrcamento) {
    definirCategoriaEditando(item);
    // Exibe o limite em reais no campo (ex: 500.00 -> 500)
    definirValorInput((item.limiteCentavos / 100).toFixed(2).replace('.', ','));
    definirErroModal(null);
  }

  function fecharModalEdicao() {
    definirCategoriaEditando(null);
    definirValorInput('');
    definirErroModal(null);
  }

  async function salvarNovoLimite() {
    if (!categoriaEditando) return;

    const valorLimpo = valorInput.replace(/\./g, '').replace(',', '.').trim();
    const numeroReais = parseFloat(valorLimpo);

    if (isNaN(numeroReais) || numeroReais < 0) {
      definirErroModal('Informe um valor válido maior ou igual a zero.');
      return;
    }

    const novosLimites: Partial<Record<CategoriaDespesa, number>> = {
      ...limites,
      [categoriaEditando.categoria]: Math.round(numeroReais * 100),
    };

    definirLimites(novosLimites);

    try {
      await AsyncStorage.setItem(CHAVE_STORAGE_ORCAMENTOS, JSON.stringify(novosLimites));
      Alert.alert(
        'Meta Atualizada',
        `Limite de ${categoriaEditando.nomeCategoria} definido para ${formatarMoeda(Math.round(numeroReais * 100))}.`
      );
    } catch (err) {
      Alert.alert('Aviso', 'Não foi possível persistir no armazenamento local.');
    }

    fecharModalEdicao();
  }

  async function restaurarPadroes() {
    Alert.alert(
      'Restaurar Padrões',
      'Deseja redefinir os limites de todas as categorias para as recomendações originais?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            definirLimites({});
            try {
              await AsyncStorage.removeItem(CHAVE_STORAGE_ORCAMENTOS);
              Alert.alert('Sucesso', 'Limites restaurados com sucesso.');
            } catch (err) {
              console.warn('Erro ao limpar orçamentos:', err);
            }
          },
        },
      ]
    );
  }

  return (
    <Tela edges={['top', 'right', 'left']}>
      <CabecalhoNavegacao rotaAtiva="categorias" />

      {/* Topo da Seção */}
      <View style={estilos.cabecalhoSecao}>
        <View style={estilos.textosTitulo}>
          <Texto variante="titulo" accessibilityRole="header">
            Categorias & Metas
          </Texto>
          <Texto tom="secundaria">
            Defina limites mensais de gastos e acompanhe o consumo de cada categoria.
          </Texto>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Restaurar limites padrão"
          onPress={restaurarPadroes}
          style={[estilos.botaoReset, { borderColor: cores.borda, backgroundColor: cores.superficie }]}>
          <Ionicons name="refresh-outline" size={16} color={cores.primaria} />
          <Texto variante="legenda" tom="primaria" style={estilos.textoBotaoReset}>
            Padrões
          </Texto>
        </Pressable>
      </View>

      {/* Cartão de Resumo Consolidado */}
      <Cartao>
        <Texto variante="subtitulo">Visão Geral dos Orçamentos</Texto>
        <Texto tom="secundaria" variante="legenda" style={estilos.subtituloResumo}>
          Confronto entre o total estipulado e as despesas registradas.
        </Texto>

        <View style={estilos.linhaValores}>
          <View style={estilos.colunaValor}>
            <Texto variante="legenda" tom="secundaria">
              Total Orçado
            </Texto>
            <Texto variante="valor">{formatarMoeda(resumo.totalOrcadoCentavos)}</Texto>
          </View>

          <View style={estilos.divisorVertical} />

          <View style={estilos.colunaValor}>
            <Texto variante="legenda" tom="secundaria">
              Total Gasto
            </Texto>
            <Texto
              variante="valor"
              style={{
                color:
                  resumo.totalGastoCentavos > resumo.totalOrcadoCentavos
                    ? cores.perigo
                    : cores.primaria,
              }}>
              {formatarMoeda(resumo.totalGastoCentavos)}
            </Texto>
          </View>
        </View>

        {/* Barra de Progresso Global com Flexbox */}
        <View style={[estilos.trilhoProgresso, { backgroundColor: cores.borda }]}>
          <View
            style={[
              estilos.preenchimentoProgresso,
              {
                width: `${percentualGeral}%`,
                backgroundColor:
                  resumo.totalGastoCentavos > resumo.totalOrcadoCentavos
                    ? cores.perigo
                    : percentualGeral >= 80
                      ? cores.aviso
                      : cores.primaria,
              },
            ]}
          />
        </View>

        {/* Badges de Status */}
        <View style={estilos.linhaBadges}>
          <View style={[estilos.badge, { backgroundColor: cores.superficieElevada }]}>
            <Ionicons name="checkmark-circle" size={14} color={cores.primaria} />
            <Texto variante="legenda" style={estilos.badgeTexto}>
              {resumo.categoriasDentroMeta} na meta
            </Texto>
          </View>

          {resumo.categoriasAlerta > 0 && (
            <View style={[estilos.badge, { backgroundColor: cores.superficieElevada }]}>
              <Ionicons name="alert-circle" size={14} color={cores.aviso} />
              <Texto variante="legenda" style={estilos.badgeTexto}>
                {resumo.categoriasAlerta} em alerta
              </Texto>
            </View>
          )}

          {resumo.categoriasExcedidas > 0 && (
            <View style={[estilos.badge, { backgroundColor: cores.superficieElevada }]}>
              <Ionicons name="close-circle" size={14} color={cores.perigo} />
              <Texto variante="legenda" style={estilos.badgeTexto}>
                {resumo.categoriasExcedidas} excedidas
              </Texto>
            </View>
          )}
        </View>
      </Cartao>

      {/* Lista de Categorias com Progresso e Ações */}
      <Texto variante="subtitulo" style={estilos.tituloLista}>
        Orçamento por Categoria
      </Texto>

      {resumo.itens.map((item) => {
        const icone = ICONES_CATEGORIAS[item.categoria] ?? 'pricetag-outline';
        const larguraBarra = Math.min(item.porcentagemConsumida, 100);

        const corStatus =
          item.status === 'excedido'
            ? cores.perigo
            : item.status === 'alerta'
              ? cores.aviso
              : cores.primaria;

        const textoTag =
          item.status === 'excedido'
            ? `Excedido (${item.porcentagemConsumida}%)`
            : item.status === 'alerta'
              ? `Alerta (${item.porcentagemConsumida}%)`
              : `${item.porcentagemConsumida}% consumido`;

        return (
          <Cartao key={item.categoria}>
            <View style={estilos.linhaItem}>
              <View style={[estilos.iconeContainer, { backgroundColor: cores.superficieElevada }]}>
                <Ionicons name={icone} size={22} color={corStatus} />
              </View>

              <View style={estilos.infoCategoria}>
                <View style={estilos.topoItem}>
                  <Texto variante="corpo" style={estilos.nomeCategoria}>
                    {item.nomeCategoria}
                  </Texto>
                  <View style={[estilos.tagStatus, { borderColor: corStatus }]}>
                    <Texto variante="legenda" style={{ color: corStatus }}>
                      {textoTag}
                    </Texto>
                  </View>
                </View>

                {/* Valores: Gasto vs Limite */}
                <View style={estilos.linhaValoresItem}>
                  <Texto variante="legenda" tom="secundaria">
                    Gasto: <Texto variante="legenda">{formatarMoeda(item.gastoCentavos)}</Texto>
                  </Texto>
                  <Texto variante="legenda" tom="secundaria">
                    Meta: <Texto variante="legenda">{formatarMoeda(item.limiteCentavos)}</Texto>
                  </Texto>
                </View>

                {/* Barra de Progresso com Flexbox */}
                <View style={[estilos.trilhoProgressoPequeno, { backgroundColor: cores.borda }]}>
                  <View
                    style={[
                      estilos.preenchimentoProgresso,
                      {
                        width: `${larguraBarra}%`,
                        backgroundColor: corStatus,
                      },
                    ]}
                  />
                </View>

                {/* Saldo Restante / Excedido e Botão Editar */}
                <View style={estilos.rodapeItem}>
                  <Texto variante="legenda" tom="secundaria">
                    {item.saldoRestanteCentavos >= 0
                      ? `Resta ${formatarMoeda(item.saldoRestanteCentavos)}`
                      : `Estourou por ${formatarMoeda(Math.abs(item.saldoRestanteCentavos))}`}
                  </Texto>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Ajustar limite de ${item.nomeCategoria}`}
                    onPress={() => abrirModalEdicao(item)}
                    style={[estilos.botaoAjustar, { backgroundColor: cores.superficieElevada }]}>
                    <Ionicons name="pencil" size={12} color={cores.primaria} />
                    <Texto variante="legenda" tom="primaria" style={estilos.textoBotaoAjustar}>
                      Ajustar
                    </Texto>
                  </Pressable>
                </View>
              </View>
            </View>
          </Cartao>
        );
      })}

      {/* Modal de Ajuste de Limite */}
      <Modal
        visible={!!categoriaEditando}
        animationType="fade"
        transparent
        onRequestClose={fecharModalEdicao}>
        <View style={estilos.fundoModal}>
          <View
            style={[
              estilos.conteudoModal,
              { backgroundColor: cores.superficie, borderColor: cores.borda },
            ]}>
            <View style={estilos.cabecalhoModal}>
              <Texto variante="subtitulo">Ajustar Limite</Texto>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar modal"
                onPress={fecharModalEdicao}>
                <Ionicons name="close" size={22} color={cores.textoSecundario} />
              </Pressable>
            </View>

            {categoriaEditando && (
              <>
                <Texto tom="secundaria" variante="legenda">
                  Defina o teto mensal para a categoria{' '}
                  <Texto variante="legenda">{categoriaEditando.nomeCategoria}</Texto>. Gastos
                  atuais: {formatarMoeda(categoriaEditando.gastoCentavos)}.
                </Texto>

                <View style={estilos.espacoCampo}>
                  <CampoTexto
                    rotulo="Limite Mensal (R$)"
                    placeholder="Ex: 800,00"
                    keyboardType="numeric"
                    value={valorInput}
                    onChangeText={(txt) => {
                      definirValorInput(txt);
                      definirErroModal(null);
                    }}
                    erro={erroModal ?? undefined}
                  />
                </View>

                {/* Atalhos Rápidos */}
                <View style={estilos.atalhosRapidos}>
                  {[100, 300, 500, 1000].map((v) => (
                    <Pressable
                      key={v}
                      accessibilityRole="button"
                      accessibilityLabel={`Definir R$ ${v}`}
                      onPress={() => definirValorInput(`${v},00`)}
                      style={[estilos.botaoAtalho, { backgroundColor: cores.superficieElevada }]}>
                      <Texto variante="legenda" tom="primaria">
                        R$ {v}
                      </Texto>
                    </Pressable>
                  ))}
                </View>

                <View style={estilos.acoesModal}>
                  <View style={estilos.colunaBotao}>
                    <Botao
                      titulo="Cancelar"
                      variante="secundaria"
                      onPress={fecharModalEdicao}
                    />
                  </View>
                  <View style={estilos.colunaBotao}>
                    <Botao
                      titulo="Salvar Limite"
                      onPress={salvarNovoLimite}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  cabecalhoSecao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: espacamentos.pequeno,
    gap: espacamentos.medio,
  },
  textosTitulo: {
    flex: 1,
  },
  botaoReset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: espacamentos.pequeno,
    paddingVertical: 6,
    borderRadius: raios.medio,
    borderWidth: 1,
  },
  textoBotaoReset: {
    fontWeight: '600',
  },
  subtituloResumo: {
    marginTop: 2,
    marginBottom: espacamentos.medio,
  },
  linhaValores: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: espacamentos.medio,
  },
  colunaValor: {
    flex: 1,
  },
  divisorVertical: {
    width: 1,
    height: 36,
    backgroundColor: '#8884',
    marginHorizontal: espacamentos.medio,
  },
  trilhoProgresso: {
    height: 10,
    borderRadius: raios.capsula,
    overflow: 'hidden',
    marginBottom: espacamentos.medio,
  },
  trilhoProgressoPequeno: {
    height: 6,
    borderRadius: raios.capsula,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 6,
  },
  preenchimentoProgresso: {
    height: '100%',
    borderRadius: raios.capsula,
  },
  linhaBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamentos.pequeno,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: espacamentos.pequeno,
    paddingVertical: 4,
    borderRadius: raios.capsula,
  },
  badgeTexto: {
    fontWeight: '500',
  },
  tituloLista: {
    marginTop: espacamentos.medio,
    marginBottom: espacamentos.pequeno,
  },
  linhaItem: {
    flexDirection: 'row',
    gap: espacamentos.medio,
    alignItems: 'flex-start',
  },
  iconeContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCategoria: {
    flex: 1,
  },
  topoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nomeCategoria: {
    fontWeight: '700',
    fontSize: 16,
  },
  tagStatus: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: raios.pequeno,
  },
  linhaValoresItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rodapeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  botaoAjustar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: raios.pequeno,
  },
  textoBotaoAjustar: {
    fontWeight: '600',
    fontSize: 12,
  },
  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: espacamentos.amplo,
  },
  conteudoModal: {
    borderRadius: raios.medio,
    borderWidth: 1,
    padding: espacamentos.amplo,
  },
  cabecalhoModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espacamentos.pequeno,
  },
  espacoCampo: {
    marginTop: espacamentos.medio,
    marginBottom: espacamentos.pequeno,
  },
  atalhosRapidos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamentos.pequeno,
    marginBottom: espacamentos.medio,
  },
  botaoAtalho: {
    paddingHorizontal: espacamentos.medio,
    paddingVertical: 6,
    borderRadius: raios.medio,
  },
  acoesModal: {
    flexDirection: 'row',
    gap: espacamentos.medio,
    marginTop: espacamentos.pequeno,
  },
  colunaBotao: {
    flex: 1,
  },
});
