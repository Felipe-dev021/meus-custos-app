import assert from 'node:assert/strict';
import test from 'node:test';

import { criarDadosDemonstracao } from '../src/dados/demonstracao.ts';
import { calcularResumoFinanceiro } from '../src/dominio/consultas-financeiras.ts';
import { pagarParcela } from '../src/dominio/operacoes-financeiras.ts';

const hoje = '2026-09-21';
const dividaId = 'demo-divida-curso';
const parcelaId = 'demo-parcela-curso-2';
const criarDados = () => criarDadosDemonstracao(new Date(2026, 8, 21));
const pagar = (dados, data = hoje) => pagarParcela(dados, dividaId, parcelaId, data, hoje);

function congelar(valor) {
  if (valor && typeof valor === 'object') {
    Object.values(valor).forEach(congelar);
    Object.freeze(valor);
  }
  return valor;
}

test('paga parcela e gera uma única despesa com valor, categoria e vínculo corretos', () => {
  const dados = congelar(criarDados());
  const resultado = pagar(dados);
  const parcela = resultado.dividas[0].parcelas[1];
  const despesa = resultado.lancamentos.find((item) => item.id === parcela.despesaId);
  assert.equal(parcela.situacao, 'paga');
  assert.equal(parcela.dataPagamento, hoje);
  assert.equal(parcela.dataVencimento, dados.dividas[0].parcelas[1].dataVencimento);
  assert.equal(despesa.tipo, 'despesa');
  assert.equal(despesa.situacao, 'paga');
  assert.equal(despesa.valorCentavos, 22000);
  assert.equal(despesa.categoria, 'educacao');
  assert.equal(despesa.data, hoje);
  assert.equal(despesa.dataPagamento, hoje);
  assert.equal(despesa.descricao, 'Curso de design · Parcela 2 de 3');
  assert.deepEqual(despesa.origem, { tipo: 'parcela', dividaId, parcelaId });
  assert.equal(resultado.lancamentos.length, dados.lancamentos.length + 1);
  assert.equal(dados.dividas[0].parcelas[1].situacao, 'pendente');
  assert.equal(resultado.dividas[0].parcelas[2], dados.dividas[0].parcelas[2]);
  assert.equal(resultado.perfil, dados.perfil);
  const antes = calcularResumoFinanceiro(dados.lancamentos);
  const depois = calcularResumoFinanceiro(resultado.lancamentos);
  assert.equal(depois.saldoDisponivel, antes.saldoDisponivel - 22000);
  assert.equal(depois.saldoPrevisto, antes.saldoPrevisto - 22000);
});

test('repetir pagamento preserva dados, data original e quantidade de despesas', () => {
  const resultado = pagar(criarDados());
  assert.equal(pagar(resultado, '2026-09-20'), resultado);
  const restaurado = JSON.parse(JSON.stringify(resultado));
  assert.equal(pagar(restaurado), restaurado);
  const demonstracao = criarDados();
  assert.equal(pagarParcela(demonstracao, dividaId, 'demo-parcela-curso-1', hoje, hoje), demonstracao);
});

test('parcelas distintas geram despesas distintas', () => {
  const dados = criarDados();
  const resultado = pagarParcela(pagar(dados), dividaId, 'demo-parcela-curso-3', hoje, hoje);
  assert.equal(resultado.lancamentos.length, dados.lancamentos.length + 2);
  assert.notEqual(resultado.dividas[0].parcelas[1].despesaId, resultado.dividas[0].parcelas[2].despesaId);
  assert.ok(resultado.dividas[0].parcelas.every((item) => item.situacao === 'paga'));
});

test('rejeita dívida, parcela e data inválidas sem alterar dados', () => {
  const dados = congelar(criarDados());
  assert.throws(() => pagarParcela(dados, 'ausente', parcelaId, hoje, hoje), /Dívida não encontrada/);
  assert.throws(() => pagarParcela(dados, dividaId, 'ausente', hoje, hoje), /Parcela não encontrada/);
  assert.throws(() => pagar(dados, '2026-02-30'), /data válida/);
  assert.throws(() => pagar(dados, '2026-09-22'), /futuro/);
  assert.equal(dados.dividas[0].parcelas[1].situacao, 'pendente');
});

test('não aceita vínculos inconsistentes nem cria outra despesa para uma parcela vinculada', () => {
  const pago = pagar(criarDados());
  const semDespesa = { ...pago, lancamentos: pago.lancamentos.slice(0, -1) };
  assert.throws(() => pagar(semDespesa), /inconsistente/);
  const duplicado = { ...pago, lancamentos: [...pago.lancamentos, { ...pago.lancamentos.at(-1), id: 'duplicada' }] };
  assert.throws(() => pagar(duplicado), /inconsistente/);
  const valorDiferente = JSON.parse(JSON.stringify(pago));
  valorDiferente.lancamentos.at(-1).valorCentavos = 1;
  assert.throws(() => pagar(valorDiferente), /inconsistente/);
  const pendenteComDespesa = { ...pago, dividas: criarDados().dividas };
  assert.throws(() => pagar(pendenteComDespesa), /já possui/);
});

test('falhas na criação da despesa não deixam a parcela marcada como paga', () => {
  const dados = criarDados();
  dados.dividas[0].parcelas[1].valorCentavos = 0;
  assert.throws(() => pagar(dados), /maior que zero/);
  assert.equal(dados.dividas[0].parcelas[1].situacao, 'pendente');
  assert.equal(dados.lancamentos.length, 9);
  const colisao = criarDados();
  colisao.lancamentos[0].id = `parcela:${dividaId}:${parcelaId}`;
  assert.throws(() => pagar(colisao), /Já existe/);
  assert.equal(colisao.dividas[0].parcelas[1].situacao, 'pendente');
  assert.equal(colisao.lancamentos.length, 9);
});
