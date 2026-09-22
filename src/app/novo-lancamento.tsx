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
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { cores, espacamentos, raios } from '@/tema';
import {
  converterDataBrasileiraParaCivil,
  converterRealParaCentavos,
  formatarData,
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
        navegador.replace('/(principal)/visao-geral');
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
          else navegador.replace('/(principal)/visao-geral');
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
      <View style={estilos.seletorTipo}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Selecionar tipo Receita"
          accessibilityState={{ selected: tipo === 'receita' }}
          onPress={() => alternarTipo('receita')}
          style={[
            estilos.opcaoTipo,
            tipo === 'receita' && estilos.opcaoTipoAtiva,
          ]}>
          <Texto
            variante="rotulo"
            tom={tipo === 'receita' ? 'primaria' : 'secundaria'}>
            ↗ Receita
          </Texto>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Selecionar tipo Despesa"
          accessibilityState={{ selected: tipo === 'despesa' }}
          onPress={() => alternarTipo('despesa')}
          style={[
            estilos.opcaoTipo,
            tipo === 'despesa' && estilos.opcaoTipoAtiva,
          ]}>
          <Texto
            variante="rotulo"
            tom={tipo === 'despesa' ? 'primaria' : 'secundaria'}>
            ↙ Despesa
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
                    selecionada && estilos.chipCategoriaAtivo,
                  ]}>
                  <Texto
                    variante="legenda"
                    tom={selecionada ? 'primaria' : 'secundaria'}
                    style={selecionada && estilos.textoChipAtivo}>
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
                  situacao === 'paga' && estilos.opcaoSituacaoAtiva,
                ]}>
                <Texto
                  variante="rotulo"
                  tom={situacao === 'paga' ? 'primaria' : 'secundaria'}>
                  ✓ Já paga
                </Texto>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Marcar como despesa pendente"
                accessibilityState={{ selected: situacao === 'pendente' }}
                onPress={() => definirSituacao('pendente')}
                style={[
                  estilos.opcaoSituacao,
                  situacao === 'pendente' && estilos.opcaoSituacaoAtiva,
                ]}>
                <Texto
                  variante="rotulo"
                  tom={situacao === 'pendente' ? 'primaria' : 'secundaria'}>
                  ⏳ Pendente
                </Texto>
              </Pressable>
            </View>
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
    backgroundColor: cores.superficie,
    padding: espacamentos.minimo,
    borderRadius: raios.pequeno,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  opcaoTipo: {
    flex: 1,
    paddingVertical: espacamentos.medio,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raios.pequeno - 2,
  },
  opcaoTipoAtiva: {
    backgroundColor: cores.superficieElevada,
    borderWidth: 1,
    borderColor: cores.primaria,
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
    borderColor: cores.borda,
    backgroundColor: cores.superficieElevada,
  },
  chipCategoriaAtivo: {
    borderColor: cores.primaria,
    backgroundColor: cores.primariaSuave,
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
    paddingVertical: espacamentos.medio,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raios.pequeno,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficieElevada,
  },
  opcaoSituacaoAtiva: {
    borderColor: cores.primaria,
    backgroundColor: cores.primariaSuave,
  },
  botaoSalvar: {
    marginTop: espacamentos.medio,
  },
});
