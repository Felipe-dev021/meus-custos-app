import assert from 'node:assert/strict';
import test from 'node:test';

import { criarDadosDemonstracao } from '../src/dados/demonstracao.ts';
import {
  calcularGastosPorCategoria,
  calcularResumoFinanceiro,
  listarReceitas,
  listarUltimosLancamentos,
} from '../src/dominio/consultas-financeiras.ts';

const receita = (id, valorCentavos, data = '2026-09-01') => ({
  id, descricao: 'Receita de teste', tipo: 'receita', categoria: 'salario',
  situacao: 'recebida', valorCentavos, data,
});

const despesa = (id, valorCentavos, situacao = 'paga', categoria = 'moradia') => ({
  id, descricao: 'Despesa de teste', tipo: 'despesa', categoria,
  situacao, valorCentavos, data: '2026-09-02', origem: { tipo: 'manual' },
  ...(situacao === 'paga' ? { dataPagamento: '2026-09-02' } : {}),
});

test('separa saldo disponível e previsão sem duplicar a parcela da demonstração', () => {
  const dados = criarDadosDemonstracao(new Date(2026, 8, 21));
  assert.deepEqual(calcularResumoFinanceiro(dados.lancamentos), {
    receitasRecebidas: 605000,
    despesasPagas: 230650,
    despesasPendentes: 24980,
    saldoDisponivel: 374350,
    saldoPrevisto: 349370,
  });
});

test('retorna totais zerados e listas vazias quando não existem lançamentos', () => {
  assert.deepEqual(calcularResumoFinanceiro([]), {
    receitasRecebidas: 0, despesasPagas: 0, despesasPendentes: 0,
    saldoDisponivel: 0, saldoPrevisto: 0,
  });
  assert.deepEqual(calcularGastosPorCategoria([]), []);
  assert.deepEqual(listarReceitas([]), []);
  assert.deepEqual(listarUltimosLancamentos([]), []);
});

test('aceita saldo e previsão negativos e preserva centavos exatos', () => {
  const lancamentos = [receita('r1', 10010), despesa('d1', 12020), despesa('d2', 3030, 'pendente')];
  assert.deepEqual(calcularResumoFinanceiro(lancamentos), {
    receitasRecebidas: 10010, despesasPagas: 12020, despesasPendentes: 3030,
    saldoDisponivel: -2010, saldoPrevisto: -5040,
  });
});

test('quitar uma despesa altera o saldo disponível, mas não desconta novamente na previsão', () => {
  const antes = [receita('r1', 100000), despesa('d1', 25000, 'pendente')];
  const depois = [antes[0], despesa('d1', 25000, 'paga')];
  const resumoAntes = calcularResumoFinanceiro(antes);
  const resumoDepois = calcularResumoFinanceiro(depois);
  assert.equal(resumoAntes.saldoDisponivel, 100000);
  assert.equal(resumoDepois.saldoDisponivel, 75000);
  assert.equal(resumoDepois.despesasPendentes, 0);
  assert.equal(resumoAntes.saldoPrevisto, resumoDepois.saldoPrevisto);
});

test('agrupa apenas pagamentos por categoria e ordena pelo maior gasto', () => {
  const lancamentos = [
    receita('r1', 500000),
    despesa('d1', 10000, 'paga', 'alimentacao'),
    despesa('d2', 1550, 'paga', 'alimentacao'),
    despesa('d3', 40000, 'paga', 'moradia'),
    despesa('d4', 90000, 'pendente', 'alimentacao'),
  ];
  const gastos = calcularGastosPorCategoria(lancamentos);
  assert.deepEqual(gastos, [
    { categoria: 'moradia', valorCentavos: 40000 },
    { categoria: 'alimentacao', valorCentavos: 11550 },
  ]);
  assert.equal(gastos.reduce((total, gasto) => total + gasto.valorCentavos, 0),
    calcularResumoFinanceiro(lancamentos).despesasPagas);
});

test('ordena por data, desempata pela inserção e não modifica os dados originais', () => {
  const lancamentos = Object.freeze([
    Object.freeze(receita('antiga', 100, '2025-12-31')),
    Object.freeze(receita('nova', 200, '2026-01-01')),
    Object.freeze(receita('mesmo-dia', 300, '2026-01-01')),
    Object.freeze(despesa('despesa-recente', 100)),
  ]);
  assert.deepEqual(listarReceitas(lancamentos).map((item) => item.id), ['mesmo-dia', 'nova', 'antiga']);
  assert.deepEqual(listarUltimosLancamentos(lancamentos, 2).map((item) => item.id),
    ['despesa-recente', 'mesmo-dia']);
  assert.equal(listarUltimosLancamentos(lancamentos).length, 4);
  assert.deepEqual(listarUltimosLancamentos(lancamentos, 0), []);
  assert.deepEqual(lancamentos.map((item) => item.id), ['antiga', 'nova', 'mesmo-dia', 'despesa-recente']);
  calcularResumoFinanceiro(lancamentos);
  calcularGastosPorCategoria(lancamentos);
});

test('rejeita valores inválidos e operações que perderiam precisão', () => {
  for (const valor of [0, -1, 0.5, NaN, Infinity]) {
    assert.throws(() => calcularResumoFinanceiro([receita('r1', valor)]), RangeError);
    assert.throws(() => calcularGastosPorCategoria([despesa('d1', valor)]), RangeError);
  }
  assert.throws(() => calcularResumoFinanceiro([
    receita('r1', Number.MAX_SAFE_INTEGER), receita('r2', 1),
  ]), RangeError);
  assert.throws(() => calcularResumoFinanceiro([
    despesa('d1', Number.MAX_SAFE_INTEGER), despesa('d2', 1, 'pendente'),
  ]), RangeError);
  for (const limite of [-1, 1.5, NaN, Infinity]) {
    assert.throws(() => listarUltimosLancamentos([], limite), RangeError);
  }
});
