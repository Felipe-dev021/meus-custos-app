import assert from 'node:assert/strict';
import test from 'node:test';

import { criarDadosDemonstracao } from '../src/dados/demonstracao.ts';
import { categoriasDespesa, categoriasReceita } from '../src/dominio/categorias.ts';
import { formatarMoeda, formatarData, ehDataCivil, paraDataCivil } from '../src/utilitarios/formatacao.ts';

test('formata reais a partir de centavos e rejeita valores imprecisos', () => {
  const normalizar = (texto) => texto.replace(/\s/g, ' ');
  assert.equal(normalizar(formatarMoeda(123456)), 'R$ 1.234,56');
  assert.equal(normalizar(formatarMoeda(-150)), '-R$ 1,50');
  assert.equal(normalizar(formatarMoeda(0)), 'R$ 0,00');
  for (const valor of [1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => formatarMoeda(valor), RangeError);
  }
});

test('mantém o dia brasileiro e valida calendário e anos bissextos', () => {
  assert.equal(formatarData('2026-09-21'), '21/09/2026');
  assert.equal(formatarData('2024-02-29'), '29/02/2024');
  assert.equal(paraDataCivil(new Date(2026, 8, 21, 23, 59)), '2026-09-21');
  for (const valor of ['2026-02-29', '2026-04-31', '2026-13-01', '2026-09-00', '21/09/2026', '2026-9-1']) {
    assert.equal(ehDataCivil(valor), false);
    assert.throws(() => formatarData(valor), RangeError);
  }
  assert.throws(() => paraDataCivil(new Date(NaN)), RangeError);
});

test('gera dados coerentes no início do mês, no ano novo e em fevereiro', () => {
  const referencias = [new Date(2026, 8, 21), new Date(2027, 0, 1), new Date(2024, 1, 29)];
  for (const referencia of referencias) {
    const { lancamentos, dividas } = criarDadosDemonstracao(referencia);
    const hoje = paraDataCivil(referencia);
    const ids = lancamentos.map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length);

    for (const item of lancamentos) {
      assert.ok(Number.isSafeInteger(item.valorCentavos) && item.valorCentavos > 0);
      assert.ok(ehDataCivil(item.data));
      const categorias = item.tipo === 'receita' ? categoriasReceita : categoriasDespesa;
      assert.ok(Object.hasOwn(categorias, item.categoria));
      if (item.situacao === 'pendente') {
        assert.ok(item.data > hoje);
      } else {
        assert.ok(item.data <= hoje);
        assert.equal(item.data.slice(0, 7), hoje.slice(0, 7));
      }
    }

    for (const divida of dividas) {
      for (const parcela of divida.parcelas) {
        assert.ok(ehDataCivil(parcela.dataVencimento));
        const despesas = lancamentos.filter((item) =>
          item.tipo === 'despesa' && item.origem.tipo === 'parcela'
          && item.origem.dividaId === divida.id && item.origem.parcelaId === parcela.id);
        if (parcela.situacao === 'paga') {
          assert.equal(despesas.length, 1);
          assert.equal(despesas[0].id, parcela.despesaId);
          assert.equal(despesas[0].valorCentavos, parcela.valorCentavos);
          assert.equal(despesas[0].dataPagamento, parcela.dataPagamento);
          assert.equal(despesas[0].situacao, 'paga');
        } else {
          assert.equal(despesas.length, 0);
          assert.ok(parcela.dataVencimento > hoje);
        }
      }
    }
  }
});

test('cada demonstração recebe objetos independentes e pode ser serializada', () => {
  const referencia = new Date(2026, 8, 21);
  const primeiro = criarDadosDemonstracao(referencia);
  const segundo = criarDadosDemonstracao(referencia);
  assert.deepEqual(JSON.parse(JSON.stringify(primeiro)), primeiro);
  assert.deepEqual(primeiro, segundo);
  primeiro.perfil.nome = 'Outro nome';
  primeiro.lancamentos[0].valorCentavos = 1;
  primeiro.dividas[0].parcelas[0].valorCentavos = 1;
  assert.equal(segundo.perfil.nome, 'Marina Oliveira');
  assert.equal(segundo.lancamentos[0].valorCentavos, 520000);
  assert.equal(segundo.dividas[0].parcelas[0].valorCentavos, 22000);
  assert.throws(() => criarDadosDemonstracao(new Date(NaN)), RangeError);
});
