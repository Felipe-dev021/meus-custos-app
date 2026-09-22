import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type PropsWithChildren } from 'react';

import { Botao } from '@/componentes/Botao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import { CHAVE_DADOS } from '@/dados/persistencia';

import {
  calcularGastosPorCategoria,
  calcularResumoDividas,
  calcularResumoFinanceiro,
  listarDespesas,
  listarReceitas,
  listarUltimosLancamentos,
} from '@/dominio/consultas-financeiras';
import { criarEstadoFinanceiro } from '@/estado/estado-financeiro';

const ContextoFinanceiro = createContext<ReturnType<typeof criarEstadoFinanceiro> | null>(null);

export function ProvedorFinanceiro({ children }: PropsWithChildren) {
  const [central] = useState(() => criarEstadoFinanceiro(undefined, {
    ler: () => AsyncStorage.getItem(CHAVE_DADOS),
    gravar: (conteudo) => AsyncStorage.setItem(CHAVE_DADOS, conteudo),
  }));
  const estado = useSyncExternalStore(central.assinar, central.obterEstado, central.obterEstado);
  useEffect(() => { void central.iniciar(); }, [central]);

  if (!estado.carregado || estado.erroArmazenamento) {
    return (
      <Tela>
        <Texto variante="subtitulo">{estado.erroArmazenamento ? 'Precisamos tentar novamente' : 'Carregando sua demonstração…'}</Texto>
        {estado.erroArmazenamento && <>
          <Texto tom="secundaria" accessibilityLiveRegion="polite">{estado.erroArmazenamento}</Texto>
          <Botao titulo="Tentar novamente" onPress={() => { void central.tentarNovamente(); }} />
        </>}
      </Tela>
    );
  }
  return <ContextoFinanceiro.Provider value={central}>{children}</ContextoFinanceiro.Provider>;
}

export function useFinanceiro() {
  const central = useContext(ContextoFinanceiro);
  if (!central) throw new Error('useFinanceiro deve ser usado dentro do ProvedorFinanceiro.');
  const estado = useSyncExternalStore(central.assinar, central.obterEstado, central.obterEstado);
  const consultas = useMemo(() => ({
    resumo: calcularResumoFinanceiro(estado.dados.lancamentos),
    resumoDividas: calcularResumoDividas(estado.dados.dividas),
    receitas: listarReceitas(estado.dados.lancamentos),
    despesas: listarDespesas(estado.dados.lancamentos),
    gastosPorCategoria: calcularGastosPorCategoria(estado.dados.lancamentos),
    ultimosLancamentos: listarUltimosLancamentos(estado.dados.lancamentos),
  }), [estado.dados.lancamentos, estado.dados.dividas]);

  return { ...estado, ...consultas, executar: central.executar };
}
