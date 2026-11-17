import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatarTextoRelatorio,
  gerarRelatorioFinanceiro,
} from '../src/dominio/relatorios.ts';

test('gera relatório correto para lista vazia de lançamentos', () => {
  const relatorio = gerarRelatorioFinanceiro([]);
  assert.equal(relatorio.totalReceitasCentavos, 0);
  assert.equal(relatorio.totalDespesasPagasCentavos, 0);
  assert.equal(relatorio.saldoLiquidoCentavos, 0);
  assert.equal(relatorio.taxaEconomiaPercentual, 0);
  assert.equal(relatorio.totalLancamentos, 0);
  assert.equal(relatorio.distribuicaoCategorias.length, 0);
});

test('calcula totais, saldo líquido e taxa de economia com precisão', () => {
  const lancamentos = [
    {
      id: '1',
      tipo: 'receita',
      descricao: 'Salário',
      valorCentavos: 500000, // R$ 5.000,00
      data: '2026-11-01',
      categoria: 'salario',
      origem: 'manual',
    },
    {
      id: '2',
      tipo: 'despesa',
      descricao: 'Aluguel',
      valorCentavos: 150000, // R$ 1.500,00
      data: '2026-11-05',
      categoria: 'moradia',
      situacao: 'paga',
      dataPagamento: '2026-11-05',
      origem: { tipo: 'manual' },
    },
    {
      id: '3',
      tipo: 'despesa',
      descricao: 'Mercado',
      valorCentavos: 50000, // R$ 500,00
      data: '2026-11-10',
      categoria: 'alimentacao',
      situacao: 'paga',
      dataPagamento: '2026-11-10',
      origem: { tipo: 'manual' },
    },
    {
      id: '4',
      tipo: 'despesa',
      descricao: 'Internet futura',
      valorCentavos: 15000, // R$ 150,00 pendente
      data: '2026-11-25',
      categoria: 'servicos',
      situacao: 'pendente',
      origem: { tipo: 'manual' },
    },
  ];

  const relatorio = gerarRelatorioFinanceiro(lancamentos);

  assert.equal(relatorio.totalReceitasCentavos, 500000);
  assert.equal(relatorio.totalDespesasPagasCentavos, 200000); // 1500 + 500
  assert.equal(relatorio.totalDespesasPendentesCentavos, 15000);
  assert.equal(relatorio.saldoLiquidoCentavos, 300000); // 5000 - 2000 = 3000

  // Taxa de economia = (3000 / 5000) * 100 = 60.0%
  assert.equal(relatorio.taxaEconomiaPercentual, 60.0);
  assert.equal(relatorio.situacao, 'positiva');

  // Distribuição: moradia (1500 / 2000 = 75%), alimentacao (500 / 2000 = 25%)
  assert.equal(relatorio.distribuicaoCategorias.length, 2);
  assert.equal(relatorio.distribuicaoCategorias[0].categoria, 'moradia');
  assert.equal(relatorio.distribuicaoCategorias[0].porcentagem, 75);
  assert.equal(relatorio.distribuicaoCategorias[1].categoria, 'alimentacao');
  assert.equal(relatorio.distribuicaoCategorias[1].porcentagem, 25);
});

test('identifica situação crítica quando despesas superam receitas', () => {
  const lancamentos = [
    {
      id: '1',
      tipo: 'receita',
      descricao: 'Renda',
      valorCentavos: 100000,
      data: '2026-11-01',
      categoria: 'salario',
      origem: 'manual',
    },
    {
      id: '2',
      tipo: 'despesa',
      descricao: 'Gasto excessivo',
      valorCentavos: 150000,
      data: '2026-11-05',
      categoria: 'lazer',
      situacao: 'paga',
      dataPagamento: '2026-11-05',
      origem: { tipo: 'manual' },
    },
  ];

  const relatorio = gerarRelatorioFinanceiro(lancamentos);
  assert.equal(relatorio.situacao, 'critica');
  assert.equal(relatorio.saldoLiquidoCentavos, -50000);
});

test('formata texto de exportação do relatório corretamente', () => {
  const relatorio = gerarRelatorioFinanceiro([
    {
      id: '1',
      tipo: 'receita',
      descricao: 'Salário',
      valorCentavos: 200000,
      data: '2026-11-01',
      categoria: 'salario',
      origem: 'manual',
    },
  ]);

  const texto = formatarTextoRelatorio(relatorio);
  assert.match(texto, /RELATÓRIO FINANCEIRO/);
  assert.match(texto, /Receitas: R\$ 2000\.00/);
});
