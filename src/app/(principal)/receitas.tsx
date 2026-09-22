import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Botao } from '@/componentes/Botao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Cartao } from '@/componentes/Cartao';
import { Marca } from '@/componentes/Marca';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import { categoriasReceita } from '@/dominio/categorias';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { cores, espacamentos } from '@/tema';
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

  return (
    <Tela edges={['top', 'right', 'left']}>
      <Marca />

      <View style={estilos.cabecalho}>
        <Texto variante="titulo" accessibilityRole="header">
          Receitas
        </Texto>
        <Texto tom="secundaria">
          Acompanhe suas entradas e rendimentos cadastrados.
        </Texto>
      </View>

      {/* Cartão de Total Recebido */}
      <Cartao style={estilos.cartaoTotal}>
        <Texto variante="legenda" tom="secundaria">
          {busca.trim() ? 'TOTAL FILTRADO' : 'TOTAL RECEBIDO'}
        </Texto>
        <Texto variante="valor" tom="primaria">
          {formatarMoeda(totalExibido)}
        </Texto>
        <Texto variante="legenda" tom="secundaria">
          {busca.trim()
            ? `${receitasFiltradas.length} de ${receitas.length} receitas encontradas`
            : `${receitas.length} receitas registradas no total`}
        </Texto>
      </Cartao>

      {/* Botão de adicionar receita */}
      <Botao
        titulo="+ Adicionar receita"
        onPress={() => navegador.push({ pathname: '/novo-lancamento', params: { tipo: 'receita' } })}
      />

      {/* Campo de busca */}
      <CampoTexto
        rotulo="Buscar receitas"
        placeholder="Filtrar por descrição ou categoria..."
        value={busca}
        onChangeText={definirBusca}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Listagem de receitas */}
      <Cartao>
        <Texto variante="subtitulo" accessibilityRole="header">
          Lista de receitas
        </Texto>

        {receitas.length === 0 ? (
          <View style={estilos.areaVazia}>
            <Texto tom="secundaria">Nenhuma receita registrada até o momento.</Texto>
            <Botao
              titulo="Cadastrar primeira receita"
              variante="secundaria"
              onPress={() => navegador.push({ pathname: '/novo-lancamento', params: { tipo: 'receita' } })}
              style={estilos.botaoVazio}
            />
          </View>
        ) : receitasFiltradas.length === 0 ? (
          <View style={estilos.areaVazia}>
            <Texto tom="secundaria">
              {`Nenhuma receita encontrada para "${busca}".`}
            </Texto>
            <Botao
              titulo="Limpar busca"
              variante="secundaria"
              onPress={() => definirBusca('')}
              style={estilos.botaoVazio}
            />
          </View>
        ) : (
          <View style={estilos.lista}>
            {receitasFiltradas.map((item, index) => (
              <View
                key={item.id}
                style={[
                  estilos.itemReceita,
                  index > 0 && estilos.separadorReceita,
                ]}>
                <View style={estilos.infoReceita}>
                  <Texto variante="corpo" style={estilos.descricao}>
                    {item.descricao}
                  </Texto>
                  <Texto variante="legenda" tom="secundaria">
                    {categoriasReceita[item.categoria] ?? item.categoria} · {formatarData(item.data)}
                  </Texto>
                </View>

                <Texto variante="rotulo" tom="primaria" style={estilos.valor}>
                  + {formatarMoeda(item.valorCentavos)}
                </Texto>
              </View>
            ))}
          </View>
        )}
      </Cartao>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  cabecalho: {
    gap: espacamentos.minimo,
  },
  cartaoTotal: {
    backgroundColor: cores.superficieElevada,
  },
  areaVazia: {
    paddingVertical: espacamentos.grande,
    gap: espacamentos.medio,
    alignItems: 'flex-start',
  },
  botaoVazio: {
    marginTop: espacamentos.pequeno,
  },
  lista: {
    marginTop: espacamentos.pequeno,
  },
  itemReceita: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: espacamentos.medio,
  },
  separadorReceita: {
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  infoReceita: {
    flex: 1,
    gap: 2,
    marginRight: espacamentos.medio,
  },
  descricao: {
    fontWeight: '600',
  },
  valor: {
    fontWeight: '700',
  },
});
