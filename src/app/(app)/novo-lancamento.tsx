import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Botao } from '@/componentes/Botao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Cartao } from '@/componentes/Cartao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import { categoriasDespesa, categoriasReceita } from '@/dominio/categorias';
import type { CategoriaDespesa, CategoriaReceita } from '@/dominio/financeiro';
import type { NovoLancamento } from '@/dominio/operacoes-financeiras';
import { gerarDividaRecorrente, INTERVALOS_PADRAO_DIAS } from '@/dominio/recorrencia';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { espacamentos, raios } from '@/tema';
import { useTema } from '@/tema/ContextoTema';
import {
  converterDataBrasileiraParaCivil,
  converterRealParaCentavos,
  formatarData,
  formatarMoeda,
  paraDataCivil,
} from '@/utilitarios/formatacao';

type ParametrosRota = {
  tipo?: 'receita' | 'despesa';
};

type ErrosFormulario = {
  descricao?: string;
  valor?: string;
  data?: string;
  geral?: string;
};

export default function TelaNovoLancamento() {
  const navegador = useRouter();
  const parametros = useLocalSearchParams<ParametrosRota>();
  const { executar, salvando } = useFinanceiro();
  const { cores } = useTema();

  const [tipo, definirTipo] = useState<'receita' | 'despesa'>(
    parametros.tipo === 'receita' ? 'receita' : 'despesa',
  );
  const [descricao, definirDescricao] = useState('');
  const [valorTexto, definirValorTexto] = useState('');
  const [categoria, definirCategoria] = useState<string>(
    parametros.tipo === 'receita' ? 'salario' : 'alimentacao',
  );
  const [dataTexto, definirDataTexto] = useState(() =>
    formatarData(paraDataCivil(new Date())),
  );
  const [situacao, definirSituacao] = useState<'paga' | 'pendente'>('paga');
  const [ehRecorrente, definirEhRecorrente] = useState(false);
  const [intervaloEscolhido, definirIntervaloEscolhido] = useState<number | 'personalizado'>(30);
  const [intervaloCustomizadoTexto, definirIntervaloCustomizadoTexto] = useState('30');
  const [quantidadeRepeticoesTexto, definirQuantidadeRepeticoesTexto] = useState('12');
  const [erros, definirErros] = useState<ErrosFormulario>({});

  function alternarTipo(novoTipo: 'receita' | 'despesa') {
    definirTipo(novoTipo);
    definirCategoria(novoTipo === 'receita' ? 'salario' : 'alimentacao');
    definirErros({});
  }

  function aoSalvar() {
    const novosErros: ErrosFormulario = {};
    const hoje = paraDataCivil(new Date());

    const descricaoLimpa = descricao.trim();
    if (!descricaoLimpa) {
      novosErros.descricao = 'Informe uma descrição.';
    } else if (descricaoLimpa.length > 120) {
      novosErros.descricao = 'A descrição deve ter até 120 caracteres.';
    }

    const valorCentavos = converterRealParaCentavos(valorTexto);
    if (!valorCentavos) {
      novosErros.valor = 'Informe um valor maior que zero em reais (ex: 150,00).';
    }

    const dataCivil = converterDataBrasileiraParaCivil(dataTexto);
    if (!dataCivil) {
      novosErros.data = 'Informe uma data válida no formato DD/MM/AAAA.';
    } else {
      const exigeDataPassada = tipo === 'receita' || situacao === 'paga';
      if (exigeDataPassada && dataCivil > hoje) {
        novosErros.data = 'Recebimentos e pagamentos não podem estar no futuro.';
      }
    }

    if (Object.keys(novosErros).length > 0) {
      definirErros(novosErros);
      return;
    }

    try {
      if (tipo === 'despesa' && ehRecorrente) {
        const diasIntervalo =
          intervaloEscolhido === 'personalizado'
            ? parseInt(intervaloCustomizadoTexto, 10)
            : intervaloEscolhido;

        if (!diasIntervalo || diasIntervalo < 1 || diasIntervalo > 365) {
          definirErros({ geral: 'Informe um intervalo entre 1 e 365 dias.' });
          return;
        }

        const qtd = parseInt(quantidadeRepeticoesTexto, 10);
        if (!qtd || qtd < 1 || qtd > 120) {
          definirErros({ geral: 'Informe uma quantidade de parcelas entre 1 e 120.' });
          return;
        }

        const divida = gerarDividaRecorrente({
          descricao: descricaoLimpa,
          categoria: categoria as CategoriaDespesa,
          valorCentavos: valorCentavos!,
          dataInicio: dataCivil!,
          quantidadeParcelas: qtd,
          intervaloDias: diasIntervalo,
        });

        executar({ tipo: 'cadastrar-divida', divida });

        if (situacao === 'paga' && divida.parcelas.length > 0) {
          executar({
            tipo: 'pagar-parcela',
            dividaId: divida.id,
            parcelaId: divida.parcelas[0].id,
            dataPagamento: dataCivil!,
            hoje,
          });
        }

        navegador.replace('/(app)/dividas');
        return;
      }

      const entrada: NovoLancamento =
        tipo === 'receita'
          ? {
              tipo: 'receita',
              descricao: descricaoLimpa,
              valorCentavos: valorCentavos!,
              data: dataCivil!,
              categoria: categoria as CategoriaReceita,
            }
          : {
              tipo: 'despesa',
              descricao: descricaoLimpa,
              valorCentavos: valorCentavos!,
              data: dataCivil!,
              categoria: categoria as CategoriaDespesa,
              situacao,
            };

      const id = `${tipo}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      executar({ tipo: 'cadastrar-lancamento', entrada, id, hoje });

      if (navegador.canGoBack()) {
        navegador.back();
      } else {
        navegador.replace('/');
      }
    } catch (erro) {
      definirErros({
        geral: erro instanceof Error ? erro.message : 'Não foi possível cadastrar o lançamento.',
      });
    }
  }

  const categoriasDisponiveis = tipo === 'receita' ? categoriasReceita : categoriasDespesa;

  return (
    <Tela contentContainerStyle={estilos.conteudo}>
      <Botao
        titulo="← Voltar"
        variante="secundaria"
        onPress={() => {
          if (navegador.canGoBack()) navegador.back();
          else navegador.replace('/');
        }}
        style={estilos.botaoVoltar}
      />

      <View style={estilos.cabecalho}>
        <Texto variante="titulo" accessibilityRole="header">
          Novo lançamento
        </Texto>
        <Texto tom="secundaria">
          Adicione uma movimentação ao seu controle financeiro.
        </Texto>
      </View>

      {/* Seletor de Tipo (Receita / Despesa) */}
      <View
        style={[
          estilos.seletorTipo,
          {
            backgroundColor: cores.superficie,
            borderColor: cores.borda,
          },
        ]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Selecionar tipo Receita"
          accessibilityState={{ selected: tipo === 'receita' }}
          onPress={() => alternarTipo('receita')}
          style={[
            estilos.opcaoTipo,
            tipo === 'receita' && [
              estilos.opcaoTipoAtiva,
              {
                backgroundColor: cores.superficieElevada,
                borderColor: cores.primaria,
              },
            ],
          ]}>
          <Ionicons
            name="trending-up-outline"
            size={16}
            color={tipo === 'receita' ? cores.primaria : cores.textoSecundario}
          />
          <Texto
            variante="rotulo"
            tom={tipo === 'receita' ? 'primaria' : 'secundaria'}>
            Receita
          </Texto>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Selecionar tipo Despesa"
          accessibilityState={{ selected: tipo === 'despesa' }}
          onPress={() => alternarTipo('despesa')}
          style={[
            estilos.opcaoTipo,
            tipo === 'despesa' && [
              estilos.opcaoTipoAtiva,
              {
                backgroundColor: cores.superficieElevada,
                borderColor: cores.primaria,
              },
            ],
          ]}>
          <Ionicons
            name="card-outline"
            size={16}
            color={tipo === 'despesa' ? cores.primaria : cores.textoSecundario}
          />
          <Texto
            variante="rotulo"
            tom={tipo === 'despesa' ? 'primaria' : 'secundaria'}>
            Despesa
          </Texto>
        </Pressable>
      </View>

      {/* Formulário */}
      <Cartao>
        <CampoTexto
          rotulo="Descrição"
          placeholder={tipo === 'receita' ? 'Ex: Salário, Trabalho freelance...' : 'Ex: Supermercado, Aluguel...'}
          value={descricao}
          onChangeText={(texto) => {
            definirDescricao(texto);
            if (erros.descricao) definirErros((ant) => ({ ...ant, descricao: undefined }));
          }}
          erro={erros.descricao}
        />

        <CampoTexto
          rotulo="Valor (R$)"
          placeholder="0,00"
          value={valorTexto}
          onChangeText={(texto) => {
            definirValorTexto(texto);
            if (erros.valor) definirErros((ant) => ({ ...ant, valor: undefined }));
          }}
          keyboardType="decimal-pad"
          erro={erros.valor}
        />

        {/* Atalhos Rápidos de Valor */}
        <View style={estilos.linhaAtalhosValor}>
          {[50, 100, 250, 500].map((v) => (
            <Pressable
              key={v}
              accessibilityRole="button"
              accessibilityLabel={`Preencher valor R$ ${v},00`}
              onPress={() => {
                definirValorTexto(`${v},00`);
                if (erros.valor) definirErros((ant) => ({ ...ant, valor: undefined }));
              }}
              style={[
                estilos.chipAtalhoValor,
                {
                  backgroundColor: cores.superficieElevada,
                  borderColor: cores.borda,
                },
              ]}>
              <Texto variante="legenda" tom="primaria">
                R$ {v}
              </Texto>
            </Pressable>
          ))}
        </View>

        {/* Seletor de Categorias */}
        <View style={estilos.secaoCampo}>
          <Texto variante="rotulo">Categoria</Texto>
          <View style={estilos.gridCategorias}>
            {Object.entries(categoriasDisponiveis).map(([chave, rotulo]) => {
              const selecionada = categoria === chave;
              return (
                <Pressable
                  key={chave}
                  accessibilityRole="button"
                  accessibilityLabel={`Categoria ${rotulo}`}
                  accessibilityState={{ selected: selecionada }}
                  onPress={() => definirCategoria(chave)}
                  style={[
                    estilos.chipCategoria,
                    {
                      borderColor: selecionada ? cores.primaria : cores.borda,
                      backgroundColor: selecionada ? cores.primariaSuave : cores.superficieElevada,
                    },
                  ]}>
                  <Texto
                    variante="legenda"
                    style={[
                      { color: selecionada ? cores.primaria : cores.textoSecundario },
                      selecionada && estilos.textoChipAtivo,
                    ]}>
                    {rotulo}
                  </Texto>
                </Pressable>
              );
            })}
          </View>
        </View>

        <CampoTexto
          rotulo="Data"
          placeholder="DD/MM/AAAA"
          value={dataTexto}
          onChangeText={(texto) => {
            definirDataTexto(texto);
            if (erros.data) definirErros((ant) => ({ ...ant, data: undefined }));
          }}
          keyboardType="numeric"
          erro={erros.data}
        />

        {/* Situação de pagamento (para despesas) */}
        {tipo === 'despesa' && (
          <View style={estilos.secaoCampo}>
            <Texto variante="rotulo">Situação do pagamento</Texto>
            <View style={estilos.seletorSituacao}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Marcar como despesa paga"
                accessibilityState={{ selected: situacao === 'paga' }}
                onPress={() => definirSituacao('paga')}
                style={[
                  estilos.opcaoSituacao,
                  {
                    borderColor: situacao === 'paga' ? cores.primaria : cores.borda,
                    backgroundColor: situacao === 'paga' ? cores.primariaSuave : cores.superficieElevada,
                  },
                ]}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color={situacao === 'paga' ? cores.primaria : cores.textoSecundario}
                />
                <Texto
                  variante="rotulo"
                  tom={situacao === 'paga' ? 'primaria' : 'secundaria'}>
                  Já paga
                </Texto>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Marcar como despesa pendente"
                accessibilityState={{ selected: situacao === 'pendente' }}
                onPress={() => definirSituacao('pendente')}
                style={[
                  estilos.opcaoSituacao,
                  {
                    borderColor: situacao === 'pendente' ? cores.primaria : cores.borda,
                    backgroundColor: situacao === 'pendente' ? cores.primariaSuave : cores.superficieElevada,
                  },
                ]}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={situacao === 'pendente' ? cores.primaria : cores.textoSecundario}
                />
                <Texto
                  variante="rotulo"
                  tom={situacao === 'pendente' ? 'primaria' : 'secundaria'}>
                  Pendente
                </Texto>
              </Pressable>
            </View>
          </View>
        )}

        {/* Configuração de Despesa / Dívida Recorrente */}
        {tipo === 'despesa' && (
          <View style={estilos.secaoRecorrencia}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: ehRecorrente }}
              accessibilityLabel="Ativar despesa recorrente ou parcelamento"
              onPress={() => definirEhRecorrente((ant) => !ant)}
              style={[
                estilos.cardToggleRecorrencia,
                {
                  borderColor: ehRecorrente ? cores.primaria : cores.borda,
                  backgroundColor: ehRecorrente ? cores.primariaSuave : cores.superficieElevada,
                },
              ]}>
              <View style={estilos.linhaToggle}>
                <Ionicons
                  name={ehRecorrente ? 'repeat' : 'repeat-outline'}
                  size={20}
                  color={ehRecorrente ? cores.primaria : cores.textoSecundario}
                />
                <View style={{ flex: 1 }}>
                  <Texto variante="rotulo" tom={ehRecorrente ? 'primaria' : 'padrao'}>
                    Despesa / Dívida Recorrente
                  </Texto>
                  <Texto variante="legenda" tom="secundaria">
                    Gere vencimentos para aluguel, assinaturas ou parcelamentos.
                  </Texto>
                </View>
                <Ionicons
                  name={ehRecorrente ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={ehRecorrente ? cores.primaria : cores.textoSecundario}
                />
              </View>
            </Pressable>

            {ehRecorrente && (
              <View style={[estilos.painelRecorrencia, { borderColor: cores.borda, backgroundColor: cores.superficieElevada }]}>
                <Texto variante="rotulo">Intervalo entre vencimentos</Texto>
                <View style={estilos.gridIntervalos}>
                  {INTERVALOS_PADRAO_DIAS.map((dias) => {
                    const ativo = intervaloEscolhido === dias;
                    const rotulo = dias === 30 ? '30 dias (Mensal)' : `${dias} dias`;
                    return (
                      <Pressable
                        key={dias}
                        accessibilityRole="button"
                        accessibilityLabel={`Intervalo ${rotulo}`}
                        onPress={() => {
                          definirIntervaloEscolhido(dias);
                          definirIntervaloCustomizadoTexto(String(dias));
                        }}
                        style={[
                          estilos.chipIntervalo,
                          {
                            borderColor: ativo ? cores.primaria : cores.borda,
                            backgroundColor: ativo ? cores.primariaSuave : cores.superficie,
                          },
                        ]}>
                        <Texto variante="legenda" style={ativo ? { color: cores.primaria, fontWeight: '700' } : undefined}>
                          {rotulo}
                        </Texto>
                      </Pressable>
                    );
                  })}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Intervalo personalizado"
                    onPress={() => definirIntervaloEscolhido('personalizado')}
                    style={[
                      estilos.chipIntervalo,
                      {
                        borderColor: intervaloEscolhido === 'personalizado' ? cores.primaria : cores.borda,
                        backgroundColor: intervaloEscolhido === 'personalizado' ? cores.primariaSuave : cores.superficie,
                      },
                    ]}>
                    <Texto variante="legenda" style={intervaloEscolhido === 'personalizado' ? { color: cores.primaria, fontWeight: '700' } : undefined}>
                      Personalizado
                    </Texto>
                  </Pressable>
                </View>

                {intervaloEscolhido === 'personalizado' && (
                  <CampoTexto
                    rotulo="Intervalo personalizado (em dias)"
                    placeholder="Ex: 10, 45, 60"
                    value={intervaloCustomizadoTexto}
                    onChangeText={definirIntervaloCustomizadoTexto}
                    keyboardType="numeric"
                  />
                )}

                <CampoTexto
                  rotulo="Quantidade de repetições / parcelas"
                  placeholder="Ex: 12"
                  value={quantidadeRepeticoesTexto}
                  onChangeText={definirQuantidadeRepeticoesTexto}
                  keyboardType="numeric"
                />

                <View style={[estilos.boxPreviaRecorrencia, { backgroundColor: cores.primariaSuave, borderColor: cores.primaria }]}>
                  <Ionicons name="information-circle-outline" size={18} color={cores.primaria} />
                  <Texto variante="legenda" style={{ color: cores.primaria, flex: 1 }}>
                    Serão geradas {parseInt(quantidadeRepeticoesTexto, 10) || 1} parcelas de {valorTexto ? `R$ ${valorTexto}` : 'R$ 0,00'} a cada {intervaloEscolhido === 'personalizado' ? (intervaloCustomizadoTexto || 'N') : intervaloEscolhido} dias no módulo de Dívidas.
                  </Texto>
                </View>
              </View>
            )}
          </View>
        )}

        {erros.geral && (
          <Texto variante="legenda" tom="perigo">
            {erros.geral}
          </Texto>
        )}

        <Botao
          titulo="Salvar lançamento"
          carregando={salvando}
          onPress={aoSalvar}
          style={estilos.botaoSalvar}
        />
      </Cartao>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  conteudo: {
    paddingTop: espacamentos.grande,
    paddingBottom: espacamentos.amplo,
    gap: espacamentos.grande,
  },
  botaoVoltar: {
    alignSelf: 'flex-start',
  },
  cabecalho: {
    gap: espacamentos.minimo,
  },
  seletorTipo: {
    flexDirection: 'row',
    gap: espacamentos.medio,
    padding: espacamentos.minimo,
    borderRadius: raios.pequeno,
    borderWidth: 1,
  },
  opcaoTipo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: espacamentos.medio,
    borderRadius: raios.pequeno - 2,
  },
  opcaoTipoAtiva: {
    borderWidth: 1,
  },
  secaoCampo: {
    gap: espacamentos.pequeno,
  },
  gridCategorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamentos.pequeno,
  },
  chipCategoria: {
    paddingHorizontal: espacamentos.medio,
    paddingVertical: espacamentos.pequeno,
    borderRadius: raios.capsula,
    borderWidth: 1,
  },
  textoChipAtivo: {
    fontWeight: '600',
  },
  seletorSituacao: {
    flexDirection: 'row',
    gap: espacamentos.medio,
  },
  opcaoSituacao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: espacamentos.medio,
    borderRadius: raios.pequeno,
    borderWidth: 1,
  },
  botaoSalvar: {
    marginTop: espacamentos.medio,
  },
  linhaAtalhosValor: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamentos.pequeno,
  },
  chipAtalhoValor: {
    paddingHorizontal: espacamentos.medio,
    paddingVertical: 5,
    borderRadius: raios.capsula,
    borderWidth: 1,
  },
  secaoRecorrencia: {
    gap: espacamentos.pequeno,
    marginTop: espacamentos.minimo,
  },
  cardToggleRecorrencia: {
    padding: espacamentos.medio,
    borderRadius: raios.pequeno,
    borderWidth: 1,
  },
  linhaToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.medio,
  },
  painelRecorrencia: {
    padding: espacamentos.medio,
    borderRadius: raios.pequeno,
    borderWidth: 1,
    gap: espacamentos.medio,
  },
  gridIntervalos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamentos.pequeno,
  },
  chipIntervalo: {
    paddingHorizontal: espacamentos.medio,
    paddingVertical: espacamentos.pequeno,
    borderRadius: raios.capsula,
    borderWidth: 1,
  },
  boxPreviaRecorrencia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.pequeno,
    padding: espacamentos.medio,
    borderRadius: raios.pequeno,
    borderWidth: 1,
  },
});
