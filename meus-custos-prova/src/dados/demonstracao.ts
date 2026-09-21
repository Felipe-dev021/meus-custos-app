import type { DadosFinanceiros, DataCivil } from '../dominio/financeiro';
import { paraDataCivil } from '../utilitarios/formatacao.ts';

/** Criar apenas ao iniciar os dados da demonstração, nunca a cada renderização. */
export function criarDadosDemonstracao(dataReferencia = new Date()): DadosFinanceiros {
  // As entradas e saídas quitadas ficam no mês atual, sem datas futuras.
  const dataQuitada = (dia: number): DataCivil => paraDataCivil(new Date(
    dataReferencia.getFullYear(),
    dataReferencia.getMonth(),
    Math.min(dia, dataReferencia.getDate()),
    12,
  ));

  const dataFutura = (dias: number): DataCivil => paraDataCivil(new Date(
    dataReferencia.getFullYear(),
    dataReferencia.getMonth(),
    dataReferencia.getDate() + dias,
    12,
  ));

  // Valida antes de construir os lançamentos.
  paraDataCivil(dataReferencia);
  const dataPagamentoParcela = dataQuitada(12);

  return {
    perfil: {
      nome: 'Marina Oliveira',
      email: 'marina@example.com',
    },
    lancamentos: [
      {
        id: 'demo-receita-salario',
        tipo: 'receita',
        descricao: 'Salário mensal',
        valorCentavos: 520000,
        data: dataQuitada(5),
        categoria: 'salario',
        situacao: 'recebida',
      },
      {
        id: 'demo-receita-trabalho-extra',
        tipo: 'receita',
        descricao: 'Projeto de identidade visual',
        valorCentavos: 85000,
        data: dataQuitada(10),
        categoria: 'trabalho-extra',
        situacao: 'recebida',
      },
      {
        id: 'demo-despesa-aluguel',
        tipo: 'despesa',
        descricao: 'Aluguel',
        valorCentavos: 140000,
        data: dataQuitada(6),
        categoria: 'moradia',
        situacao: 'paga',
        dataPagamento: dataQuitada(6),
        origem: { tipo: 'manual' },
      },
      {
        id: 'demo-despesa-mercado',
        tipo: 'despesa',
        descricao: 'Compras do mercado',
        valorCentavos: 38650,
        data: dataQuitada(8),
        categoria: 'alimentacao',
        situacao: 'paga',
        dataPagamento: dataQuitada(8),
        origem: { tipo: 'manual' },
      },
      {
        id: 'demo-despesa-transporte',
        tipo: 'despesa',
        descricao: 'Recarga do transporte',
        valorCentavos: 18000,
        data: dataQuitada(9),
        categoria: 'transporte',
        situacao: 'paga',
        dataPagamento: dataQuitada(9),
        origem: { tipo: 'manual' },
      },
      {
        id: 'demo-despesa-curso-1',
        tipo: 'despesa',
        descricao: 'Curso de design · Parcela 1 de 3',
        valorCentavos: 22000,
        data: dataPagamentoParcela,
        categoria: 'educacao',
        situacao: 'paga',
        dataPagamento: dataPagamentoParcela,
        origem: {
          tipo: 'parcela',
          dividaId: 'demo-divida-curso',
          parcelaId: 'demo-parcela-curso-1',
        },
      },
      {
        id: 'demo-despesa-lazer',
        tipo: 'despesa',
        descricao: 'Cinema e jantar',
        valorCentavos: 12000,
        data: dataQuitada(15),
        categoria: 'lazer',
        situacao: 'paga',
        dataPagamento: dataQuitada(15),
        origem: { tipo: 'manual' },
      },
      {
        id: 'demo-despesa-energia',
        tipo: 'despesa',
        descricao: 'Conta de energia',
        valorCentavos: 15990,
        data: dataFutura(3),
        categoria: 'moradia',
        situacao: 'pendente',
        origem: { tipo: 'manual' },
      },
      {
        id: 'demo-despesa-internet',
        tipo: 'despesa',
        descricao: 'Internet residencial',
        valorCentavos: 8990,
        data: dataFutura(6),
        categoria: 'servicos',
        situacao: 'pendente',
        origem: { tipo: 'manual' },
      },
    ],
    dividas: [
      {
        id: 'demo-divida-curso',
        descricao: 'Curso de design',
        categoria: 'educacao',
        parcelas: [
          {
            id: 'demo-parcela-curso-1',
            numero: 1,
            valorCentavos: 22000,
            dataVencimento: dataPagamentoParcela,
            situacao: 'paga',
            dataPagamento: dataPagamentoParcela,
            despesaId: 'demo-despesa-curso-1',
          },
          {
            id: 'demo-parcela-curso-2',
            numero: 2,
            valorCentavos: 22000,
            dataVencimento: dataFutura(30),
            situacao: 'pendente',
          },
          {
            id: 'demo-parcela-curso-3',
            numero: 3,
            valorCentavos: 22000,
            dataVencimento: dataFutura(60),
            situacao: 'pendente',
          },
        ],
      },
    ],
  };
}
