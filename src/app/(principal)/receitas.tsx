import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CabecalhoNavegacao } from '@/componentes/CabecalhoNavegacao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Cartao } from '@/componentes/Cartao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import { categoriasReceita } from '@/dominio/categorias';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { cores, espacamentos, raios } from '@/tema';
import { formatarData, formatarMoeda } from '@/utilitarios/formatacao';

export default function TelaReceitas() {
  const navegador = useRouter();
  const { receitas, resumo } = useFinanceiro();
  const [busca, definirBusca] = useState('');

  const receitasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return receitas;

    return receitas.filter((item) => {
      const nomeCategoria = (categoriasReceita[item.categoria] ?? item.categoria).toLowerCase();
      const descricao = item.descricao.toLowerCase();
      return descricao.includes(termo) || nomeCategoria.includes(termo);
    });
  }, [receitas, busca]);

  const totalExibido = useMemo(() => {
    if (!busca.trim()) return resumo.receitasRecebidas;
    return receitasFiltradas.reduce((total, item) => total + item.valorCentavos, 0);
  }, [busca, receitasFiltradas, resumo.receitasRecebidas]);

  const mediaPorLancamento = useMemo(() => {
    if (receitasFiltradas.length === 0) return 0;
    return Math.round(totalExibido / receitasFiltradas.length);
  }, [receitasFiltradas.length, totalExibido]);

  return (
    <Tela edges={['top', 'right', 'left']}>
      {/* Topo com Logo e Menu Hambúrguer */}
      <CabecalhoNavegacao rotaAtiva="receitas" />

      {/* Título da Tela e Botão de Ação rápida */}
      <View style={estilos.cabecalhoSecao}>
        <View style={estilos.textosTitulo}>
          <Texto variante="titulo" accessibilityRole="header">
            {'Receitas (rendas)'}
          </Texto>
          <Texto tom="secundaria">
            Registre e acompanhe suas entradas por data de recebimento
          </Texto>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cadastrar nova receita"
          onPress={() => navegador.push({ pathname: '/novo-lancamento', params: { tipo: 'receita' } })}
          style={estilos.botaoAcaoVerde}>
          <Texto variante="rotulo" style={estilos.textoBotaoAcao}>
            + Nova receita
          </Texto>
        </Pressable>
      </View>

      {/* Grade de Cartões de Métricas (Igual ao site/fotos) */}
      <View style={estilos.gradeMetricas}>
        <View style={estilos.linhaMetricas}>
          {/* Card 1: Total de entradas */}
          <Cartao style={estilos.cartaoMetrica}>
            <View style={estilos.iconeCaixa}>
              <Texto variante="rotulo" style={estilos.simboloIcone}>$</Texto>
            </View>
            <Texto variante="legenda" tom="secundaria">Total de entradas</Texto>
            <Texto variante="subtitulo" style={estilos.valorMetrica}>
              {formatarMoeda(totalExibido)}
            </Texto>
          </Cartao>

          {/* Card 2: Receitas registradas */}
          <Cartao style={estilos.cartaoMetrica}>
            <View style={estilos.iconeCaixa}>
              <Texto variante="rotulo" style={estilos.simboloIcone}>↗</Texto>
            </View>
            <Texto variante="legenda" tom="secundaria">Receitas registradas</Texto>
            <Texto variante="subtitulo" style={estilos.valorMetrica}>
              {receitasFiltradas.length}
            </Texto>
          </Cartao>
        </View>

        {/* Card 3: Média por lançamento */}
        <Cartao style={estilos.cartaoMetricaUnico}>
          <View style={estilos.iconeCaixa}>
            <Texto variante="rotulo" style={estilos.simboloIcone}>📅</Texto>
          </View>
          <Texto variante="legenda" tom="secundaria">Média por lançamento</Texto>
          <Texto variante="subtitulo" style={estilos.valorMetrica}>
            {formatarMoeda(mediaPorLancamento)}
          </Texto>
        </Cartao>
      </View>

      {/* Painel com Tabela/Lista de Entradas */}
      <Cartao style={estilos.painelLista}>
        <View style={estilos.topoPainel}>
          <View>
            <Texto variante="subtitulo" accessibilityRole="header">
              Entradas registradas
            </Texto>
            <Texto variante="legenda" tom="secundaria">
              Ordenadas por data de recebimento
            </Texto>
          </View>
        </View>

        {/* Campo de Busca integrado */}
        <CampoTexto
          rotulo="Filtrar receitas"
          placeholder="Buscar por descrição ou categoria..."
          value={busca}
          onChangeText={definirBusca}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Cabeçalho da Lista / Tabela */}
        <View style={estilos.cabecalhoTabela}>
          <Texto variante="legenda" style={estilos.colunaCabecalhoDescricao}>
            DESCRIÇÃO
          </Texto>
          <Texto variante="legenda" style={estilos.colunaCabecalhoCategoria}>
            CATEGORIA
          </Texto>
          <Texto variante="legenda" style={estilos.colunaCabecalhoData}>
            DATA / VALOR
          </Texto>
        </View>

        {receitas.length === 0 ? (
          <View style={estilos.areaVazia}>
            <Texto tom="secundaria">Nenhuma receita registrada até o momento.</Texto>
          </View>
        ) : receitasFiltradas.length === 0 ? (
          <View style={estilos.areaVazia}>
            <Texto tom="secundaria">
              {`Nenhuma receita encontrada para "${busca}".`}
            </Texto>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpar busca"
              onPress={() => definirBusca('')}
              style={estilos.botaoLimparBusca}>
              <Texto variante="rotulo" tom="primaria">
                Limpar busca
              </Texto>
            </Pressable>
          </View>
        ) : (
          <View style={estilos.listaItens}>
            {receitasFiltradas.map((item, index) => (
              <View
                key={item.id}
                style={[
                  estilos.linhaTabela,
                  index > 0 && estilos.separadorLinha,
                ]}>
                <View style={estilos.colunaDescricao}>
                  <Texto variante="corpo" style={estilos.textoDescricao}>
                    {item.descricao}
                  </Texto>
                </View>

                <View style={estilos.colunaCategoria}>
                  <View style={estilos.tagCategoriaPill}>
                    <Texto variante="legenda" tom="secundaria" style={estilos.textoCategoriaPill}>
                      {categoriasReceita[item.categoria] ?? item.categoria}
                    </Texto>
                  </View>
                </View>

                <View style={estilos.colunaValorData}>
                  <Texto variante="rotulo" tom="primaria" style={estilos.textoValorVerde}>
                    {formatarMoeda(item.valorCentavos)}
                  </Texto>
                  <Texto variante="legenda" tom="secundaria" style={estilos.textoDataPequena}>
                    {formatarData(item.data)}
                  </Texto>
                </View>
              </View>
            ))}
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
    backgroundColor: cores.primaria,
    paddingHorizontal: espacamentos.grande,
    paddingVertical: espacamentos.medio - 2,
    borderRadius: raios.pequeno,
  },
  textoBotaoAcao: {
    color: '#001a09',
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
    backgroundColor: '#121214',
    borderColor: cores.borda,
  },
  cartaoMetricaUnico: {
    padding: espacamentos.grande,
    gap: espacamentos.pequeno,
    backgroundColor: '#121214',
    borderColor: cores.borda,
  },
  iconeCaixa: {
    width: 32,
    height: 32,
    borderRadius: raios.pequeno - 2,
    backgroundColor: '#1c1c1f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  simboloIcone: {
    fontSize: 16,
    color: cores.texto,
  },
  valorMetrica: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: cores.texto,
  },
  painelLista: {
    backgroundColor: '#121214',
    gap: espacamentos.grande,
  },
  topoPainel: {
    gap: 4,
  },
  cabecalhoTabela: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: espacamentos.pequeno,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  colunaCabecalhoDescricao: {
    flex: 1.4,
    fontSize: 11,
    color: '#71717a',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  colunaCabecalhoCategoria: {
    flex: 1.2,
    fontSize: 11,
    color: '#71717a',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  colunaCabecalhoData: {
    flex: 1.2,
    fontSize: 11,
    color: '#71717a',
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
    paddingVertical: espacamentos.medio,
  },
  separadorLinha: {
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  colunaDescricao: {
    flex: 1.4,
    paddingRight: 6,
  },
  textoDescricao: {
    fontWeight: '600',
    fontSize: 15,
  },
  colunaCategoria: {
    flex: 1.2,
    paddingRight: 6,
  },
  tagCategoriaPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: espacamentos.medio,
    paddingVertical: 4,
    borderRadius: raios.capsula,
    backgroundColor: '#1c1c1f',
    borderWidth: 1,
    borderColor: cores.borda,
  },
  textoCategoriaPill: {
    fontSize: 12,
    color: cores.textoSecundario,
  },
  colunaValorData: {
    flex: 1.2,
    alignItems: 'flex-end',
    gap: 2,
  },
  textoValorVerde: {
    color: cores.primaria,
    fontWeight: '700',
    fontSize: 14,
  },
  textoDataPequena: {
    fontSize: 12,
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
