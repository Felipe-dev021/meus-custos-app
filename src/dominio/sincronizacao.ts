import type { DadosFinanceiros } from './financeiro.ts';
import { LIMITES_PADRAO_CATEGORIAS } from './orcamentos.ts';

export const CHAVE_ULTIMA_SINCRONIZACAO = '@meus-custos:ultima_sincronizacao';
export const URL_API_PADRAO = 'http://localhost:3001';

export interface ItemSincronizacaoLancamento {
  id: string;
  descricao: string;
  valorCentavos: number;
  data: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  situacao: string;
  origemTipo?: string;
  origemDividaId?: string;
  origemParcelaId?: string;
  dataPagamento?: string;
}

export interface ItemSincronizacaoDivida {
  id: string;
  descricao: string;
  categoria: string;
  parcelas: Array<{
    id: string;
    numero: number;
    valorCentavos: number;
    dataVencimento: string;
    situacao: string;
    despesaId?: string;
    dataPagamento?: string;
  }>;
}

export interface ItemSincronizacaoOrcamento {
  categoria: string;
  limiteCentavos: number;
}

export interface PayloadSincronizacaoNuvem {
  usuarioId: string;
  lancamentos: ItemSincronizacaoLancamento[];
  dividas: ItemSincronizacaoDivida[];
  orcamentos: ItemSincronizacaoOrcamento[];
}

export interface RespostaSincronizacaoNuvem {
  sucesso: boolean;
  sincronizadoEm: string;
  totais: {
    lancamentos: number;
    dividas: number;
    orcamentos: number;
  };
}

/** Prepara o payload para envio ao backend PostgreSQL */
export function montarPayloadSincronizacao(
  usuarioId: string,
  dadosFinanceiros: DadosFinanceiros | null,
  limitesPersonalizados?: Record<string, number>,
): PayloadSincronizacaoNuvem {
  if (!usuarioId) {
    throw new Error('ID do usuário é obrigatório para sincronização.');
  }

  const lancamentos: ItemSincronizacaoLancamento[] = (dadosFinanceiros?.lancamentos || []).map((l) => ({
    id: l.id,
    descricao: l.descricao,
    valorCentavos: l.valorCentavos,
    data: l.data,
    tipo: l.tipo,
    categoria: l.categoria,
    situacao: l.situacao,
    origemTipo: l.tipo === 'despesa' ? l.origem.tipo : undefined,
    origemDividaId: l.tipo === 'despesa' && l.origem.tipo === 'parcela' ? l.origem.dividaId : undefined,
    origemParcelaId: l.tipo === 'despesa' && l.origem.tipo === 'parcela' ? l.origem.parcelaId : undefined,
    dataPagamento: l.tipo === 'despesa' && l.situacao === 'paga' ? l.dataPagamento : undefined,
  }));

  const dividas: ItemSincronizacaoDivida[] = (dadosFinanceiros?.dividas || []).map((d) => ({
    id: d.id,
    descricao: d.descricao,
    categoria: d.categoria,
    parcelas: d.parcelas.map((p) => ({
      id: p.id,
      numero: p.numero,
      valorCentavos: p.valorCentavos,
      dataVencimento: p.dataVencimento,
      situacao: p.situacao,
      despesaId: p.situacao === 'paga' ? p.despesaId : undefined,
      dataPagamento: p.situacao === 'paga' ? p.dataPagamento : undefined,
    })),
  }));

  const limitesCombinados = {
    ...LIMITES_PADRAO_CATEGORIAS,
    ...(limitesPersonalizados || {}),
  };

  const orcamentos: ItemSincronizacaoOrcamento[] = Object.entries(limitesCombinados).map(([cat, limite]) => ({
    categoria: cat,
    limiteCentavos: Number(limite),
  }));

  return {
    usuarioId,
    lancamentos,
    dividas,
    orcamentos,
  };
}

/** Valida a resposta retornada pelo backend */
export function validarRespostaSincronizacao(resposta: unknown): RespostaSincronizacaoNuvem {
  if (!resposta || typeof resposta !== 'object') {
    throw new Error('Resposta de sincronização inválida.');
  }
  const r = resposta as Record<string, any>;
  if (typeof r.sucesso !== 'boolean' || typeof r.sincronizadoEm !== 'string' || !r.totais) {
    throw new Error('Formato da resposta do backend incompatível.');
  }
  return {
    sucesso: r.sucesso,
    sincronizadoEm: r.sincronizadoEm,
    totais: {
      lancamentos: Number(r.totais.lancamentos || 0),
      dividas: Number(r.totais.dividas || 0),
      orcamentos: Number(r.totais.orcamentos || 0),
    },
  };
}
