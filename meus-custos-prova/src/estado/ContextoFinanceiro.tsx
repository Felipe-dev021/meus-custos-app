import { createContext, useContext, useMemo, useState, useSyncExternalStore, type PropsWithChildren } from 'react';

import { calcularGastosPorCategoria, calcularResumoFinanceiro, listarReceitas, listarUltimosLancamentos } from '@/dominio/consultas-financeiras';
import { criarEstadoFinanceiro } from '@/estado/estado-financeiro';

const ContextoFinanceiro = createContext<ReturnType<typeof criarEstadoFinanceiro> | null>(null);

export function ProvedorFinanceiro({ children }: PropsWithChildren) {
  const [central] = useState(() => criarEstadoFinanceiro());
  return <ContextoFinanceiro.Provider value={central}>{children}</ContextoFinanceiro.Provider>;
}

export function useFinanceiro() {
  const central = useContext(ContextoFinanceiro);
  if (!central) throw new Error('useFinanceiro deve ser usado dentro do ProvedorFinanceiro.');
  const estado = useSyncExternalStore(central.assinar, central.obterEstado, central.obterEstado);
  const consultas = useMemo(() => ({
    resumo: calcularResumoFinanceiro(estado.dados.lancamentos),
    receitas: listarReceitas(estado.dados.lancamentos),
    gastosPorCategoria: calcularGastosPorCategoria(estado.dados.lancamentos),
    ultimosLancamentos: listarUltimosLancamentos(estado.dados.lancamentos),
  }), [estado.dados.lancamentos]);

  return { ...estado, ...consultas, executar: central.executar };
}
