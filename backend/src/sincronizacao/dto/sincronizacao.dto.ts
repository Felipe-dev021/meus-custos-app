export interface LancamentoSyncDto {
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

export interface ParcelaSyncDto {
  id: string;
  numero: number;
  valorCentavos: number;
  dataVencimento: string;
  situacao: string;
  despesaId?: string;
  dataPagamento?: string;
}

export interface DividaSyncDto {
  id: string;
  descricao: string;
  categoria: string;
  parcelas: ParcelaSyncDto[];
}

export interface OrcamentoSyncDto {
  categoria: string;
  limiteCentavos: number;
}

export class SincronizacaoPushDto {
  usuarioId: string;
  lancamentos?: LancamentoSyncDto[];
  dividas?: DividaSyncDto[];
  orcamentos?: OrcamentoSyncDto[];
}
