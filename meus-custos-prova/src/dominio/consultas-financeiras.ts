import type { CategoriaDespesa, Centavos, Lancamento, Receita } from './financeiro';

export type ResumoFinanceiro = {
  receitasRecebidas: Centavos;
  despesasPagas: Centavos;
  despesasPendentes: Centavos;
  saldoDisponivel: Centavos;
  saldoPrevisto: Centavos;
};

export type GastoPorCategoria = {
  categoria: CategoriaDespesa;
  valorCentavos: Centavos;
};

function somarValor(total: Centavos, valor: Centavos): Centavos {
  if (!Number.isSafeInteger(valor) || valor <= 0) {
    throw new RangeError('O lançamento deve ter um valor positivo em centavos inteiros.');
  }

  const resultado = total + valor;
  if (!Number.isSafeInteger(resultado)) {
    throw new RangeError('O total ultrapassa o limite de centavos seguros.');
  }

  return resultado;
}

/**
 * Considera todos os lançamentos cadastrados, sem filtro de mês.
 * Parcelas pagas entram somente pela despesa vinculada, nunca pela dívida.
 * A previsão desconta despesas pendentes; não inclui parcelas ainda sem lançamento.
 */
export function calcularResumoFinanceiro(lancamentos: readonly Lancamento[]): ResumoFinanceiro {
  let receitasRecebidas = 0;
  let despesasPagas = 0;
  let despesasPendentes = 0;

  for (const lancamento of lancamentos) {
    if (lancamento.tipo === 'receita') {
      receitasRecebidas = somarValor(receitasRecebidas, lancamento.valorCentavos);
    } else if (lancamento.situacao === 'paga') {
      despesasPagas = somarValor(despesasPagas, lancamento.valorCentavos);
    } else {
      despesasPendentes = somarValor(despesasPendentes, lancamento.valorCentavos);
    }
  }

  const saldoDisponivel = receitasRecebidas - despesasPagas;
  const saldoPrevisto = saldoDisponivel - despesasPendentes;
  if (!Number.isSafeInteger(saldoPrevisto)) {
    throw new RangeError('A previsão ultrapassa o limite de centavos seguros.');
  }

  return { receitasRecebidas, despesasPagas, despesasPendentes, saldoDisponivel, saldoPrevisto };
}

/** Retorna uma nova lista, com as receitas mais recentes pela data do lançamento. */
export function listarReceitas(lancamentos: readonly Lancamento[]): Receita[] {
  return lancamentos
    .filter((lancamento): lancamento is Receita => lancamento.tipo === 'receita')
    .reverse()
    .sort((primeiro, segundo) => segundo.data.localeCompare(primeiro.data));
}

/** Agrupa somente despesas pagas, do maior gasto para o menor. */
export function calcularGastosPorCategoria(lancamentos: readonly Lancamento[]): GastoPorCategoria[] {
  const totais = new Map<CategoriaDespesa, Centavos>();

  for (const lancamento of lancamentos) {
    if (lancamento.tipo === 'despesa' && lancamento.situacao === 'paga') {
      const total = totais.get(lancamento.categoria) ?? 0;
      totais.set(lancamento.categoria, somarValor(total, lancamento.valorCentavos));
    }
  }

  return Array.from(totais, ([categoria, valorCentavos]) => ({ categoria, valorCentavos }))
    .sort((primeiro, segundo) =>
      segundo.valorCentavos - primeiro.valorCentavos
      || primeiro.categoria.localeCompare(segundo.categoria));
}

/** A lista original é preservada. Na mesma data, prioriza o último item inserido. */
export function listarUltimosLancamentos(
  lancamentos: readonly Lancamento[],
  limite = 5,
): Lancamento[] {
  if (!Number.isSafeInteger(limite) || limite < 0) {
    throw new RangeError('O limite deve ser um número inteiro não negativo.');
  }

  return [...lancamentos]
    .reverse()
    .sort((primeiro, segundo) => segundo.data.localeCompare(primeiro.data))
    .slice(0, limite);
}
