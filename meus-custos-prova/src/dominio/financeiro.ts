/** Data civil no formato AAAA-MM-DD, sem horário ou fuso. */
export type DataCivil = `${number}-${number}-${number}`;

/** Valores monetários são inteiros em centavos. R$ 10,50 = 1050. */
export type Centavos = number;

export type CategoriaReceita = 'salario' | 'trabalho-extra' | 'outras-receitas';
export type CategoriaDespesa =
  | 'moradia'
  | 'alimentacao'
  | 'transporte'
  | 'saude'
  | 'educacao'
  | 'lazer'
  | 'compras'
  | 'servicos'
  | 'outras-despesas';

type LancamentoBase = {
  id: string;
  descricao: string;
  valorCentavos: Centavos;
  data: DataCivil;
};

export type Receita = LancamentoBase & {
  tipo: 'receita';
  categoria: CategoriaReceita;
  situacao: 'recebida';
};

export type OrigemDespesa =
  | { tipo: 'manual' }
  | { tipo: 'parcela'; dividaId: string; parcelaId: string };

export type Despesa = LancamentoBase & {
  tipo: 'despesa';
  categoria: CategoriaDespesa;
  origem: OrigemDespesa;
} & (
  | { situacao: 'pendente'; dataPagamento?: never }
  | { situacao: 'paga'; dataPagamento: DataCivil }
);

export type Lancamento = Receita | Despesa;

export type Parcela = {
  id: string;
  numero: number;
  valorCentavos: Centavos;
  dataVencimento: DataCivil;
} & (
  | { situacao: 'pendente'; despesaId?: never; dataPagamento?: never }
  | { situacao: 'paga'; despesaId: string; dataPagamento: DataCivil }
);

export type Divida = {
  id: string;
  descricao: string;
  categoria: CategoriaDespesa;
  parcelas: Parcela[];
};

export type Perfil = {
  nome: string;
  email: string;
};

/** Não armazena senha, sessão ou totais derivados dos lançamentos. */
export type DadosFinanceiros = {
  lancamentos: Lancamento[];
  dividas: Divida[];
  perfil: Perfil;
};
