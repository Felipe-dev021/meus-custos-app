import type { CategoriaDespesa, CategoriaReceita, DataCivil, Divida, Parcela, Receita } from './financeiro.ts';
import { ehDataCivil } from '../utilitarios/formatacao.ts';

export const INTERVALOS_PADRAO_DIAS = [7, 15, 21, 30] as const;
export type IntervaloPadraoDias = typeof INTERVALOS_PADRAO_DIAS[number];

/** Soma um número de dias a uma DataCivil (AAAA-MM-DD), respeitando meses e bissextos */
export function somarDiasDataCivil(data: DataCivil, dias: number): DataCivil {
  if (!ehDataCivil(data)) throw new Error('Data inicial inválida para cálculo de recorrência.');
  if (!Number.isSafeInteger(dias) || dias < 1) throw new Error('O intervalo em dias deve ser um número positivo.');

  const partes = data.split('-').map(Number);
  const ano = partes[0];
  const mes = partes[1] - 1;
  const dia = partes[2];

  const obj = new Date(Date.UTC(ano, mes, dia));
  obj.setUTCDate(obj.getUTCDate() + dias);

  const novoAno = obj.getUTCFullYear();
  const novoMes = String(obj.getUTCMonth() + 1).padStart(2, '0');
  const novoDia = String(obj.getUTCDate()).padStart(2, '0');

  return `${novoAno}-${novoMes}-${novoDia}` as DataCivil;
}

export interface ParametrosDividaRecorrente {
  descricao: string;
  categoria: CategoriaDespesa;
  valorCentavos: number;
  dataInicio: DataCivil;
  quantidadeParcelas: number;
  intervaloDias: number; // 7, 15, 21, 30 ou personalizado
}

/** Gera uma estrutura válida de Dívida / Recorrência com suas parcelas calculadas */
export function gerarDividaRecorrente(params: ParametrosDividaRecorrente, idCustomizado?: string): Divida {
  const descricao = params.descricao.trim();
  if (!descricao || descricao.length > 100) {
    throw new Error('A descrição da despesa recorrente deve ter até 100 caracteres.');
  }

  if (!Number.isSafeInteger(params.valorCentavos) || params.valorCentavos <= 0) {
    throw new Error('O valor de cada parcela deve ser maior que zero em centavos.');
  }

  if (!ehDataCivil(params.dataInicio)) {
    throw new Error('Data de início da recorrência inválida.');
  }

  if (!Number.isInteger(params.quantidadeParcelas) || params.quantidadeParcelas < 1 || params.quantidadeParcelas > 120) {
    throw new Error('A quantidade de repetições deve ser entre 1 e 120.');
  }

  if (!Number.isInteger(params.intervaloDias) || params.intervaloDias < 1 || params.intervaloDias > 365) {
    throw new Error('O intervalo entre vencimentos deve ser de 1 a 365 dias.');
  }

  const dividaId = idCustomizado || `recorrente-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const parcelas: Parcela[] = [];

  let dataAtual = params.dataInicio;
  for (let i = 1; i <= params.quantidadeParcelas; i++) {
    const parcelaId = `${dividaId}-p${i}`;
    parcelas.push({
      id: parcelaId,
      numero: i,
      valorCentavos: params.valorCentavos,
      dataVencimento: dataAtual,
      situacao: 'pendente',
    });

    dataAtual = somarDiasDataCivil(dataAtual, params.intervaloDias);
  }

  return {
    id: dividaId,
    descricao,
    categoria: params.categoria,
    parcelas,
  };
}

export interface ParametrosReceitaRecorrente {
  descricao: string;
  categoria: CategoriaReceita;
  valorCentavos: number;
  dataInicio: DataCivil;
  quantidadeRepeticoes: number;
  intervaloDias: number; // 7, 15, 21, 30 ou personalizado
}

/** Gera uma série de lançamentos de receitas recorrentes com datas calculadas */
export function gerarReceitasRecorrentes(
  params: ParametrosReceitaRecorrente,
  idPrefixo = 'rec-recorrente',
): Receita[] {
  const descricao = params.descricao.trim();
  if (!descricao || descricao.length > 100) {
    throw new Error('A descrição da receita recorrente deve ter até 100 caracteres.');
  }

  if (!Number.isSafeInteger(params.valorCentavos) || params.valorCentavos <= 0) {
    throw new Error('O valor de cada recebimento deve ser maior que zero em centavos.');
  }

  if (!ehDataCivil(params.dataInicio)) {
    throw new Error('Data de início da recorrência inválida.');
  }

  if (!Number.isInteger(params.quantidadeRepeticoes) || params.quantidadeRepeticoes < 1 || params.quantidadeRepeticoes > 120) {
    throw new Error('A quantidade de repetições deve ser entre 1 e 120.');
  }

  if (!Number.isInteger(params.intervaloDias) || params.intervaloDias < 1 || params.intervaloDias > 365) {
    throw new Error('O intervalo entre recebimentos deve ser de 1 a 365 dias.');
  }

  const receitas: Receita[] = [];
  let dataAtual = params.dataInicio;
  const timestampBase = Date.now();

  for (let i = 1; i <= params.quantidadeRepeticoes; i++) {
    const id = `${idPrefixo}-${timestampBase}-${i}-${Math.random().toString(36).slice(2, 5)}`;
    const descricaoFinal =
      params.quantidadeRepeticoes > 1
        ? `${descricao} (${i}/${params.quantidadeRepeticoes})`
        : descricao;

    receitas.push({
      id,
      tipo: 'receita',
      descricao: descricaoFinal,
      valorCentavos: params.valorCentavos,
      data: dataAtual,
      categoria: params.categoria,
      situacao: 'recebida',
    });

    dataAtual = somarDiasDataCivil(dataAtual, params.intervaloDias);
  }

  return receitas;
}
