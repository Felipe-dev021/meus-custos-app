import { ehDataCivil, paraDataCivil } from '../utilitarios/formatacao.ts';
import { categoriasDespesa, categoriasReceita } from './categorias.ts';
import { calcularResumoFinanceiro } from './consultas-financeiras.ts';
import type { CategoriaDespesa, CategoriaReceita, DadosFinanceiros, DataCivil, Lancamento } from './financeiro';

export type NovoLancamento = {
  descricao: string;
  valorCentavos: number;
  data: DataCivil;
} & (
  | { tipo: 'receita'; categoria: CategoriaReceita }
  | { tipo: 'despesa'; categoria: CategoriaDespesa; situacao: 'paga' | 'pendente' }
);

type CampoLancamento = 'descricao' | 'valorCentavos' | 'data' | 'categoria' | 'tipo' | 'situacao';

export class ErroValidacaoLancamento extends Error {
  readonly campo: CampoLancamento;

  constructor(campo: CampoLancamento, mensagem: string) {
    super(mensagem);
    this.name = 'ErroValidacaoLancamento';
    this.campo = campo;
  }
}

function validarDataPagamento(data: DataCivil, hoje: DataCivil) {
  if (!ehDataCivil(hoje)) throw new RangeError('A data de referência é inválida.');
  if (!ehDataCivil(data)) {
    throw new ErroValidacaoLancamento('data', 'Informe uma data válida.');
  }
  if (data > hoje) {
    throw new ErroValidacaoLancamento('data', 'Um pagamento ou recebimento não pode estar no futuro.');
  }
}

/** Retorna novos dados; nunca altera o estado recebido nem cria totais paralelos. */
export function cadastrarLancamento(
  dados: DadosFinanceiros,
  entrada: NovoLancamento,
  id: string,
  hoje = paraDataCivil(new Date()),
): DadosFinanceiros {
  if (!id.trim() || id !== id.trim()) throw new Error('Identificador de lançamento inválido.');
  if (dados.lancamentos.some((lancamento) => lancamento.id === id)) {
    throw new Error('Já existe um lançamento com este identificador.');
  }
  if (!ehDataCivil(hoje)) throw new RangeError('A data de referência é inválida.');

  const descricao = entrada.descricao.trim();
  if (!descricao || descricao.length > 120) {
    throw new ErroValidacaoLancamento('descricao', 'Informe uma descrição de até 120 caracteres.');
  }
  if (!Number.isSafeInteger(entrada.valorCentavos) || entrada.valorCentavos <= 0) {
    throw new ErroValidacaoLancamento('valorCentavos', 'Informe um valor maior que zero, em centavos inteiros.');
  }
  if (!ehDataCivil(entrada.data)) {
    throw new ErroValidacaoLancamento('data', 'Informe uma data válida.');
  }
  if (entrada.tipo !== 'receita' && entrada.tipo !== 'despesa') {
    throw new ErroValidacaoLancamento('tipo', 'Escolha receita ou despesa.');
  }
  const categorias = entrada.tipo === 'receita' ? categoriasReceita : categoriasDespesa;
  if (!Object.hasOwn(categorias, entrada.categoria)) {
    throw new ErroValidacaoLancamento('categoria', 'Escolha uma categoria válida para o lançamento.');
  }

  const base = { id, descricao, valorCentavos: entrada.valorCentavos, data: entrada.data };
  let lancamento: Lancamento;

  if (entrada.tipo === 'receita') {
    validarDataPagamento(entrada.data, hoje);
    lancamento = { ...base, tipo: 'receita', categoria: entrada.categoria, situacao: 'recebida' };
  } else {
    if (entrada.situacao !== 'paga' && entrada.situacao !== 'pendente') {
      throw new ErroValidacaoLancamento('situacao', 'Escolha se a despesa está paga ou pendente.');
    }
    const despesa = {
      ...base, tipo: 'despesa' as const, categoria: entrada.categoria, origem: { tipo: 'manual' as const },
    };
    if (entrada.situacao === 'paga') {
      validarDataPagamento(entrada.data, hoje);
      lancamento = { ...despesa, situacao: 'paga', dataPagamento: entrada.data };
    } else {
      lancamento = { ...despesa, situacao: 'pendente' };
    }
  }

  const lancamentos = [...dados.lancamentos, lancamento];
  // Impede salvar valores que fariam os indicadores perderem precisão.
  calcularResumoFinanceiro(lancamentos);
  return { ...dados, lancamentos };
}

/** Quitar novamente a mesma despesa não cria outro lançamento nem altera o pagamento. */
export function pagarDespesa(
  dados: DadosFinanceiros,
  id: string,
  dataPagamento: DataCivil,
  hoje = paraDataCivil(new Date()),
): DadosFinanceiros {
  validarDataPagamento(dataPagamento, hoje);
  const despesa = dados.lancamentos.find((lancamento) => lancamento.id === id);
  if (!despesa || despesa.tipo !== 'despesa') throw new Error('Despesa não encontrada.');
  if (despesa.situacao === 'paga') return dados;
  if (despesa.origem.tipo === 'parcela') {
    throw new Error('O pagamento deve ser realizado pela parcela da dívida.');
  }

  const lancamentos = dados.lancamentos.map((lancamento): Lancamento =>
    lancamento.id === id ? { ...despesa, situacao: 'paga', dataPagamento } : lancamento);
  calcularResumoFinanceiro(lancamentos);
  return { ...dados, lancamentos };
}
