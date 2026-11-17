import { categoriasDespesa } from './categorias.ts';
import type { CategoriaDespesa, Lancamento } from './financeiro.ts';

export interface ItemDistribuicaoCategoria {
  categoria: CategoriaDespesa | string;
  nomeCategoria: string;
  totalCentavos: number;
  porcentagem: number;
}

export interface ResumoRelatorio {
  totalReceitasCentavos: number;
  totalDespesasPagasCentavos: number;
  totalDespesasPendentesCentavos: number;
  saldoLiquidoCentavos: number;
  taxaEconomiaPercentual: number;
  mediaPorDespesaCentavos: number;
  totalLancamentos: number;
  quantidadeReceitas: number;
  quantidadeDespesas: number;
  situacao: 'positiva' | 'atencao' | 'critica';
  distribuicaoCategorias: ItemDistribuicaoCategoria[];
}

/** Calcula estatísticas e relatórios avançados a partir dos lançamentos */
export function gerarRelatorioFinanceiro(lancamentos: Lancamento[]): ResumoRelatorio {
  let totalReceitasCentavos = 0;
  let totalDespesasPagasCentavos = 0;
  let totalDespesasPendentesCentavos = 0;
  let quantidadeReceitas = 0;
  let quantidadeDespesas = 0;

  const somaPorCategoria: Record<string, number> = {};

  for (const lancamento of lancamentos) {
    if (lancamento.tipo === 'receita') {
      totalReceitasCentavos += lancamento.valorCentavos;
      quantidadeReceitas += 1;
    } else {
      quantidadeDespesas += 1;
      if (lancamento.situacao === 'paga') {
        totalDespesasPagasCentavos += lancamento.valorCentavos;
        somaPorCategoria[lancamento.categoria] =
          (somaPorCategoria[lancamento.categoria] ?? 0) + lancamento.valorCentavos;
      } else {
        totalDespesasPendentesCentavos += lancamento.valorCentavos;
      }
    }
  }

  const saldoLiquidoCentavos = totalReceitasCentavos - totalDespesasPagasCentavos;

  // Taxa de economia = (Saldo Líquido / Total Receitas) * 100
  let taxaEconomiaPercentual = 0;
  if (totalReceitasCentavos > 0) {
    const proporcao = (saldoLiquidoCentavos / totalReceitasCentavos) * 100;
    taxaEconomiaPercentual = Math.round(proporcao * 10) / 10;
  }

  // Média por despesa
  const mediaPorDespesaCentavos =
    quantidadeDespesas > 0
      ? Math.round((totalDespesasPagasCentavos + totalDespesasPendentesCentavos) / quantidadeDespesas)
      : 0;

  // Diagnóstico da situação financeira
  let situacao: 'positiva' | 'atencao' | 'critica' = 'positiva';
  if (saldoLiquidoCentavos < 0) {
    situacao = 'critica';
  } else if (taxaEconomiaPercentual < 15) {
    situacao = 'atencao';
  }

  // Distribuição ordenada por categoria
  const distribuicaoCategorias: ItemDistribuicaoCategoria[] = Object.entries(somaPorCategoria)
    .map(([cat, valor]) => {
      const pct =
        totalDespesasPagasCentavos > 0
          ? Math.round((valor / totalDespesasPagasCentavos) * 1000) / 10
          : 0;
      return {
        categoria: cat,
        nomeCategoria: (categoriasDespesa as Record<string, string>)[cat] ?? cat,
        totalCentavos: valor,
        porcentagem: pct,
      };
    })
    .sort((a, b) => b.totalCentavos - a.totalCentavos);

  return {
    totalReceitasCentavos,
    totalDespesasPagasCentavos,
    totalDespesasPendentesCentavos,
    saldoLiquidoCentavos,
    taxaEconomiaPercentual,
    mediaPorDespesaCentavos,
    totalLancamentos: lancamentos.length,
    quantidadeReceitas,
    quantidadeDespesas,
    situacao,
    distribuicaoCategorias,
  };
}

/** Formata texto resumido do relatório para cópia ou compartilhamento */
export function formatarTextoRelatorio(relatorio: ResumoRelatorio): string {
  const receitasReais = (relatorio.totalReceitasCentavos / 100).toFixed(2);
  const despesasReais = (relatorio.totalDespesasPagasCentavos / 100).toFixed(2);
  const saldoReais = (relatorio.saldoLiquidoCentavos / 100).toFixed(2);

  return [
    '📊 RELATÓRIO FINANCEIRO — MEUS CUSTOS',
    `• Receitas: R$ ${receitasReais}`,
    `• Despesas pagas: R$ ${despesasReais}`,
    `• Saldo líquido: R$ ${saldoReais}`,
    `• Taxa de economia: ${relatorio.taxaEconomiaPercentual}%`,
    `• Total de movimentações: ${relatorio.totalLancamentos}`,
    `• Situação: ${relatorio.situacao.toUpperCase()}`,
  ].join('\n');
}
