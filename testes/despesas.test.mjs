import test from 'node:test';
import assert from 'node:assert/strict';

import { calcularResumoFinanceiro, listarDespesas } from '../src/dominio/consultas-financeiras.ts';
import { cadastrarLancamento, pagarDespesa, reverterPagamentoDespesa } from '../src/dominio/operacoes-financeiras.ts';

const hoje = '2026-09-22';
const dadosBase = () => ({
  lancamentos: [],
  dividas: [
    {
      id: 'divida-1',
      descricao: 'Financiamento',
      categoria: 'moradia',
      parcelas: [
        {
          id: 'parc-1',
          numero: 1,
          valorCentavos: 50000,
          dataVencimento: hoje,
          situacao: 'paga',
          dataPagamento: hoje,
          despesaId: 'despesa-parc-1',
        },
      ],
    },
  ],
  perfil: { nome: 'Lucas', email: 'lucas@example.com' },
});

test('listarDespesas retorna somente despesas ordenadas por data decrescente', () => {
  const dados = cadastrarLancamento(dadosBase(), {
    tipo: 'despesa',
    descricao: 'Energia',
    categoria: 'moradia',
    valorCentavos: 15000,
    data: '2026-09-10',
    situacao: 'paga',
  }, 'd1', hoje);

  const comReceita = cadastrarLancamento(dados, {
    tipo: 'receita',
    descricao: 'Salário',
    categoria: 'salario',
    valorCentavos: 500000,
    data: '2026-09-05',
  }, 'r1', hoje);

  const comSegundaDespesa = cadastrarLancamento(comReceita, {
    tipo: 'despesa',
    descricao: 'Internet',
    categoria: 'servicos',
    valorCentavos: 10000,
    data: '2026-09-15',
    situacao: 'pendente',
  }, 'd2', hoje);

  const despesas = listarDespesas(comSegundaDespesa.lancamentos);
  assert.equal(despesas.length, 2);
  assert.equal(despesas[0].descricao, 'Internet'); // data 2026-09-15 vem antes de 2026-09-10
  assert.equal(despesas[1].descricao, 'Energia');
});

test('reverterPagamentoDespesa alterna despesa manual para pendente e atualiza resumo', () => {
  const inicial = cadastrarLancamento(dadosBase(), {
    tipo: 'despesa',
    descricao: 'Supermercado',
    categoria: 'alimentacao',
    valorCentavos: 25000,
    data: hoje,
    situacao: 'paga',
  }, 'd1', hoje);

  const resumoPago = calcularResumoFinanceiro(inicial.lancamentos);
  assert.equal(resumoPago.despesasPagas, 25000);
  assert.equal(resumoPago.despesasPendentes, 0);

  const revertido = reverterPagamentoDespesa(inicial, 'd1');
  const despesaRevertida = revertido.lancamentos.find((l) => l.id === 'd1');
  assert.equal(despesaRevertida.situacao, 'pendente');
  assert.equal(despesaRevertida.dataPagamento, undefined);

  const resumoPendente = calcularResumoFinanceiro(revertido.lancamentos);
  assert.equal(resumoPendente.despesasPagas, 0);
  assert.equal(resumoPendente.despesasPendentes, 25000);

  // Pagar novamente
  const pagoDeNovo = pagarDespesa(revertido, 'd1', hoje, hoje);
  const despesaPaga = pagoDeNovo.lancamentos.find((l) => l.id === 'd1');
  assert.equal(despesaPaga.situacao, 'paga');
  assert.equal(despesaPaga.dataPagamento, hoje);
});

test('reverterPagamentoDespesa recusa despesa vinculada a parcela de divida', () => {
  const dados = {
    ...dadosBase(),
    lancamentos: [
      {
        id: 'despesa-parc-1',
        tipo: 'despesa',
        descricao: 'Financiamento - Parcela 1',
        categoria: 'moradia',
        valorCentavos: 50000,
        data: hoje,
        situacao: 'paga',
        dataPagamento: hoje,
        origem: {
          tipo: 'parcela',
          dividaId: 'divida-1',
          parcelaId: 'parc-1',
        },
      },
    ],
  };

  assert.throws(
    () => reverterPagamentoDespesa(dados, 'despesa-parc-1'),
    /Dívidas/,
  );
});
