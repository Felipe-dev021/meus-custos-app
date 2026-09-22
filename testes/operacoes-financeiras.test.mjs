import assert from 'node:assert/strict';
import test from 'node:test';

import { calcularResumoFinanceiro } from '../src/dominio/consultas-financeiras.ts';
import { cadastrarLancamento, ErroValidacaoLancamento, pagarDespesa } from '../src/dominio/operacoes-financeiras.ts';

const hoje = '2026-09-21';
const dadosVazios = () => ({ lancamentos: [], dividas: [], perfil: { nome: 'Marina', email: 'marina@example.com' } });
const receita = { tipo: 'receita', descricao: '  Trabalho extra  ', categoria: 'trabalho-extra', valorCentavos: 100000, data: hoje };
const despesa = { tipo: 'despesa', descricao: 'Internet', categoria: 'servicos', valorCentavos: 8990, data: '2026-09-25', situacao: 'pendente' };

test('cadastro e pagamento atualizam os mesmos indicadores sem modificar o estado anterior', () => {
  const inicial = dadosVazios();
  Object.freeze(inicial.lancamentos);
  Object.freeze(inicial);
  const comReceita = cadastrarLancamento(inicial, receita, 'r1', hoje);
  const comDespesa = cadastrarLancamento(comReceita, despesa, 'd1', hoje);
  const quitado = pagarDespesa(comDespesa, 'd1', hoje, hoje);
  assert.equal(inicial.lancamentos.length, 0);
  assert.equal(comReceita.lancamentos.length, 1);
  assert.equal(comReceita.lancamentos[0].descricao, 'Trabalho extra');
  assert.equal(comDespesa.lancamentos[1].situacao, 'pendente');
  assert.equal(quitado.lancamentos[1].situacao, 'paga');
  assert.equal(quitado.lancamentos[1].dataPagamento, hoje);
  assert.equal(quitado.lancamentos[1].data, '2026-09-25');
  assert.equal(quitado.perfil, inicial.perfil);
  assert.equal(quitado.dividas, inicial.dividas);
  assert.equal(calcularResumoFinanceiro(comDespesa.lancamentos).saldoDisponivel, 100000);
  assert.deepEqual(calcularResumoFinanceiro(quitado.lancamentos), {
    receitasRecebidas: 100000, despesasPagas: 8990, despesasPendentes: 0,
    saldoDisponivel: 91010, saldoPrevisto: 91010,
  });
  assert.equal(calcularResumoFinanceiro(comDespesa.lancamentos).saldoPrevisto, 91010);
});

test('despesa cadastrada como paga já reduz o saldo e usa origem manual', () => {
  const dados = cadastrarLancamento(dadosVazios(), { ...despesa, data: hoje, situacao: 'paga' }, 'd1', hoje);
  assert.equal(dados.lancamentos[0].dataPagamento, hoje);
  assert.deepEqual(dados.lancamentos[0].origem, { tipo: 'manual' });
  assert.equal(calcularResumoFinanceiro(dados.lancamentos).saldoDisponivel, -8990);
});

test('pagamento repetido é idempotente e cadastro com identificador repetido é rejeitado', () => {
  const dados = cadastrarLancamento(dadosVazios(), despesa, 'd1', hoje);
  const quitado = pagarDespesa(dados, 'd1', hoje, hoje);
  assert.equal(pagarDespesa(quitado, 'd1', '2026-09-20', hoje), quitado);
  assert.equal(quitado.lancamentos.length, 1);
  assert.throws(() => cadastrarLancamento(quitado, receita, 'd1', hoje), /Já existe/);
  for (const id of ['', ' ', ' r1']) {
    assert.throws(() => cadastrarLancamento(dados, receita, id, hoje), /Identificador/);
  }
});

test('rejeita entradas inválidas com indicação do campo sem alterar dados', () => {
  const dados = dadosVazios();
  const casos = [
    [{ ...receita, descricao: '  ' }, 'descricao'],
    [{ ...receita, descricao: 'a'.repeat(121) }, 'descricao'],
    ...[0, -1, 1.5, NaN, Infinity].map((valorCentavos) => [{ ...receita, valorCentavos }, 'valorCentavos']),
    [{ ...receita, data: '2026-02-30' }, 'data'],
    [{ ...receita, data: '2026-09-22' }, 'data'],
    [{ ...receita, categoria: 'moradia' }, 'categoria'],
    [{ ...receita, categoria: 'toString' }, 'categoria'],
    [{ ...receita, tipo: 'transferencia' }, 'tipo'],
    [{ ...despesa, categoria: 'salario' }, 'categoria'],
    [{ ...despesa, situacao: 'cancelada' }, 'situacao'],
    [{ ...despesa, situacao: 'paga' }, 'data'],
  ];
  for (const [entrada, campo] of casos) {
    assert.throws(() => cadastrarLancamento(dados, entrada, 'novo', hoje),
      (erro) => erro instanceof ErroValidacaoLancamento && erro.campo === campo);
    assert.equal(dados.lancamentos.length, 0);
  }
});

test('recusa pagamento inexistente, de receita ou com data inválida', () => {
  const dados = cadastrarLancamento(dadosVazios(), receita, 'r1', hoje);
  assert.throws(() => pagarDespesa(dados, 'ausente', hoje, hoje), /não encontrada/);
  assert.throws(() => pagarDespesa(dados, 'r1', hoje, hoje), /não encontrada/);
  for (const data of ['2026-02-30', '2026-09-22']) {
    assert.throws(() => pagarDespesa(dados, 'r1', data, hoje), ErroValidacaoLancamento);
  }
});

test('não permite quitar uma parcela isoladamente da dívida', () => {
  const dados = cadastrarLancamento(dadosVazios(), despesa, 'd1', hoje);
  dados.lancamentos[0].origem = { tipo: 'parcela', dividaId: 'divida1', parcelaId: 'parcela1' };
  assert.throws(() => pagarDespesa(dados, 'd1', hoje, hoje), /pela parcela/);
  assert.equal(dados.lancamentos[0].situacao, 'pendente');
});

test('recusa cadastro que ultrapassa a precisão segura dos totais', () => {
  const dados = cadastrarLancamento(dadosVazios(), { ...receita, valorCentavos: Number.MAX_SAFE_INTEGER }, 'r1', hoje);
  assert.throws(() => cadastrarLancamento(dados, { ...receita, valorCentavos: 1 }, 'r2', hoje), RangeError);
  assert.equal(dados.lancamentos.length, 1);
});
