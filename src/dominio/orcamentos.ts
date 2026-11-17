import { categoriasDespesa } from './categorias.ts';
import type { CategoriaDespesa, Lancamento } from './financeiro.ts';

export const CHAVE_STORAGE_ORCAMENTOS = '@meus_custos:orcamentos_categorias';

export interface OrcamentoCategoria {
  categoria: CategoriaDespesa;
  limiteCentavos: number;
}

export interface StatusOrcamento {
  categoria: CategoriaDespesa;
  nomeCategoria: string;
  gastoCentavos: number;
  limiteCentavos: number;
  saldoRestanteCentavos: number;
  porcentagemConsumida: number;
  status: 'dentro' | 'alerta' | 'excedido';
}

export interface ResumoOrcamentos {
  totalOrcadoCentavos: number;
  totalGastoCentavos: number;
  categoriasDentroMeta: number;
  categoriasAlerta: number;
  categoriasExcedidas: number;
  itens: StatusOrcamento[];
}

/** Limites padrão sugeridos por categoria (em centavos) */
export const LIMITES_PADRAO_CATEGORIAS: Record<CategoriaDespesa, number> = {
  moradia: 200000,      // R$ 2.000,00
  alimentacao: 150000,  // R$ 1.500,00
  transporte: 60000,    // R$ 600,00
  saude: 40000,         // R$ 400,00
  educacao: 50000,      // R$ 500,00
  lazer: 40000,         // R$ 400,00
  compras: 50000,       // R$ 500,00
  servicos: 30000,      // R$ 300,00
  'outras-despesas': 30000, // R$ 300,00
};

/** Calcula o status de orçamento de cada categoria confrontando despesas com os limites */
export function calcularStatusOrcamentos(
  lancamentos: Lancamento[],
  limitesPersonalizados?: Partial<Record<CategoriaDespesa, number>>,
): ResumoOrcamentos {
  const limitesFinais: Record<CategoriaDespesa, number> = {
    ...LIMITES_PADRAO_CATEGORIAS,
    ...(limitesPersonalizados ?? {}),
  };

  // Soma de gastos por categoria (apenas despesas pagas e manuais/parcelas)
  const gastosPorCategoria: Partial<Record<CategoriaDespesa, number>> = {};

  for (const lancamento of lancamentos) {
    if (lancamento.tipo === 'despesa') {
      const cat = lancamento.categoria;
      gastosPorCategoria[cat] = (gastosPorCategoria[cat] ?? 0) + lancamento.valorCentavos;
    }
  }

  let totalOrcadoCentavos = 0;
  let totalGastoCentavos = 0;
  let categoriasDentroMeta = 0;
  let categoriasAlerta = 0;
  let categoriasExcedidas = 0;

  const itens: StatusOrcamento[] = [];

  for (const [chave, nome] of Object.entries(categoriasDespesa)) {
    const cat = chave as CategoriaDespesa;
    const limite = Math.max(0, limitesFinais[cat] ?? 0);
    const gasto = gastosPorCategoria[cat] ?? 0;
    const saldoRestante = limite - gasto;

    totalOrcadoCentavos += limite;
    totalGastoCentavos += gasto;

    const pct = limite > 0 ? Math.round((gasto / limite) * 100) : gasto > 0 ? 100 : 0;

    let status: 'dentro' | 'alerta' | 'excedido' = 'dentro';
    if (gasto > limite && limite > 0) {
      status = 'excedido';
      categoriasExcedidas++;
    } else if (pct >= 80 && limite > 0) {
      status = 'alerta';
      categoriasAlerta++;
    } else {
      categoriasDentroMeta++;
    }

    itens.push({
      categoria: cat,
      nomeCategoria: nome,
      gastoCentavos: gasto,
      limiteCentavos: limite,
      saldoRestanteCentavos: saldoRestante,
      porcentagemConsumida: pct,
      status,
    });
  }

  // Ordena colocando primeiro os que ultrapassaram ou estão mais perto do limite
  itens.sort((a, b) => b.porcentagemConsumida - a.porcentagemConsumida);

  return {
    totalOrcadoCentavos,
    totalGastoCentavos,
    categoriasDentroMeta,
    categoriasAlerta,
    categoriasExcedidas,
    itens,
  };
}
