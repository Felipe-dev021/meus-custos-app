import { categoriasDespesa, categoriasReceita } from '../dominio/categorias.ts';
import { calcularResumoFinanceiro } from '../dominio/consultas-financeiras.ts';
import type { CategoriaDespesa, CategoriaReceita, DadosFinanceiros, Despesa, Divida, Lancamento, Parcela } from '../dominio/financeiro';
import { ehDataCivil } from '../utilitarios/formatacao.ts';

export const CHAVE_DADOS = '@meus-custos/dados-v1';

export type ArmazenamentoFinanceiro = {
  ler: () => Promise<string | null>;
  gravar: (conteudo: string) => Promise<void>;
};

function exigir(condicao: unknown): asserts condicao {
  if (!condicao) throw new Error('Os dados salvos estão inválidos ou são de uma versão incompatível.');
}

function objeto(valor: unknown): Record<string, unknown> {
  exigir(valor !== null && typeof valor === 'object' && !Array.isArray(valor));
  return valor as Record<string, unknown>;
}

function texto(valor: unknown, limite = 200): string {
  exigir(typeof valor === 'string' && valor.trim().length > 0 && valor.length <= limite);
  return valor;
}

function centavos(valor: unknown): number {
  exigir(typeof valor === 'number' && Number.isSafeInteger(valor) && valor > 0);
  return valor;
}

function data(valor: unknown) {
  exigir(typeof valor === 'string' && ehDataCivil(valor));
  return valor;
}

function categoriaDespesa(valor: unknown): CategoriaDespesa {
  exigir(typeof valor === 'string' && Object.hasOwn(categoriasDespesa, valor));
  return valor as CategoriaDespesa;
}

function lerLancamento(valor: unknown): Lancamento {
  const item = objeto(valor);
  const base = {
    id: texto(item.id), descricao: texto(item.descricao, 120),
    valorCentavos: centavos(item.valorCentavos), data: data(item.data),
  };
  if (item.tipo === 'receita') {
    exigir(item.situacao === 'recebida' && typeof item.categoria === 'string'
      && Object.hasOwn(categoriasReceita, item.categoria));
    return { ...base, tipo: 'receita', situacao: 'recebida', categoria: item.categoria as CategoriaReceita };
  }
  exigir(item.tipo === 'despesa');
  const origemSalva = objeto(item.origem);
  exigir(origemSalva.tipo === 'manual' || origemSalva.tipo === 'parcela');
  const origem: Despesa['origem'] = origemSalva.tipo === 'manual' ? { tipo: 'manual' } : {
    tipo: 'parcela', dividaId: texto(origemSalva.dividaId), parcelaId: texto(origemSalva.parcelaId),
  };
  const despesa = { ...base, tipo: 'despesa' as const, categoria: categoriaDespesa(item.categoria), origem };
  if (item.situacao === 'paga') return { ...despesa, situacao: 'paga', dataPagamento: data(item.dataPagamento) };
  exigir(item.situacao === 'pendente' && item.dataPagamento === undefined);
  return { ...despesa, situacao: 'pendente' };
}

function lerDivida(valor: unknown): Divida {
  const item = objeto(valor);
  exigir(Array.isArray(item.parcelas) && item.parcelas.length > 0);
  const parcelas = item.parcelas.map((valorParcela, indice): Parcela => {
    const parcela = objeto(valorParcela);
    exigir(parcela.numero === indice + 1);
    const base = {
      id: texto(parcela.id), numero: indice + 1,
      valorCentavos: centavos(parcela.valorCentavos), dataVencimento: data(parcela.dataVencimento),
    };
    if (parcela.situacao === 'paga') return {
      ...base, situacao: 'paga', dataPagamento: data(parcela.dataPagamento), despesaId: texto(parcela.despesaId),
    };
    exigir(parcela.situacao === 'pendente' && parcela.despesaId === undefined && parcela.dataPagamento === undefined);
    return { ...base, situacao: 'pendente' };
  });
  exigir(new Set(parcelas.map((parcela) => parcela.id)).size === parcelas.length);
  return { id: texto(item.id), descricao: texto(item.descricao, 100), categoria: categoriaDespesa(item.categoria), parcelas };
}

/** Reconstrói apenas os campos permitidos, descartando sessão e credenciais. */
function validarDados(valor: unknown): DadosFinanceiros {
  const raiz = objeto(valor);
  exigir(Array.isArray(raiz.lancamentos) && Array.isArray(raiz.dividas));
  const perfil = objeto(raiz.perfil);
  const nome = texto(perfil.nome, 80);
  const email = texto(perfil.email, 254);
  exigir(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  const lancamentos = raiz.lancamentos.map(lerLancamento);
  const dividas = raiz.dividas.map(lerDivida);
  exigir(new Set(lancamentos.map((item) => item.id)).size === lancamentos.length);
  exigir(new Set(dividas.map((item) => item.id)).size === dividas.length);
  for (const divida of dividas) {
    for (const parcela of divida.parcelas) {
      const vinculadas = lancamentos.filter((item) => item.tipo === 'despesa'
        && item.origem.tipo === 'parcela' && item.origem.dividaId === divida.id && item.origem.parcelaId === parcela.id);
      if (parcela.situacao === 'pendente') {
        exigir(vinculadas.length === 0);
      } else {
        const despesa = vinculadas[0];
        exigir(vinculadas.length === 1 && despesa.tipo === 'despesa' && despesa.situacao === 'paga'
          && despesa.id === parcela.despesaId && despesa.valorCentavos === parcela.valorCentavos
          && despesa.dataPagamento === parcela.dataPagamento && despesa.categoria === divida.categoria);
      }
    }
  }
  for (const item of lancamentos) {
    if (item.tipo !== 'despesa' || item.origem.tipo !== 'parcela') continue;
    const origem = item.origem;
    exigir(dividas.some((divida) => divida.id === origem.dividaId
      && divida.parcelas.some((parcela) => parcela.id === origem.parcelaId)));
  }
  calcularResumoFinanceiro(lancamentos);
  return { lancamentos, dividas, perfil: { nome, email } };
}

export function serializarDados(dados: DadosFinanceiros): string {
  return JSON.stringify({ versao: 1, dados: validarDados(dados) });
}

export function restaurarDados(conteudo: string): DadosFinanceiros {
  const registro = objeto(JSON.parse(conteudo));
  exigir(registro.versao === 1);
  return validarDados(registro.dados);
}
