import assert from 'node:assert/strict';
import test from 'node:test';

import { cadastrarDivida } from '../src/dominio/operacoes-financeiras.ts';
import {
  INTERVALOS_PADRAO_DIAS,
  gerarDividaRecorrente,
  somarDiasDataCivil,
} from '../src/dominio/recorrencia.ts';

test('garante que os intervalos padrao de recorrencia sejam 7, 15, 21 e 30 dias', () => {
  assert.deepEqual(INTERVALOS_PADRAO_DIAS, [7, 15, 21, 30]);
});

test('soma dias corretamente em data civil no mesmo mes', () => {
  const resultado = somarDiasDataCivil('2026-03-05', 7);
  assert.equal(resultado, '2026-03-12');
});

test('soma dias corretamente com virada de mes e ano', () => {
  const viradaMes = somarDiasDataCivil('2026-01-25', 10);
  assert.equal(viradaMes, '2026-02-04');

  const viradaAno = somarDiasDataCivil('2026-12-25', 15);
  assert.equal(viradaAno, '2027-01-09');
});

test('rejeita soma com data civil invalida ou dias nao positivos', () => {
  assert.throws(() => somarDiasDataCivil('data-invalida', 10), /Data inicial inválida/);
  assert.throws(() => somarDiasDataCivil('2026-05-10', 0), /deve ser um número positivo/);
  assert.throws(() => somarDiasDataCivil('2026-05-10', -5), /deve ser um número positivo/);
});

test('gera despesa recorrente de aluguel mensal de 30 em 30 dias com parcelas corretas', () => {
  const divida = gerarDividaRecorrente({
    descricao: 'Aluguel Apartamento',
    categoria: 'moradia',
    valorCentavos: 180000,
    dataInicio: '2026-01-10',
    quantidadeParcelas: 4,
    intervaloDias: 30,
  });

  assert.equal(divida.descricao, 'Aluguel Apartamento');
  assert.equal(divida.categoria, 'moradia');
  assert.equal(divida.parcelas.length, 4);

  // Parcela 1
  assert.equal(divida.parcelas[0].numero, 1);
  assert.equal(divida.parcelas[0].valorCentavos, 180000);
  assert.equal(divida.parcelas[0].dataVencimento, '2026-01-10');
  assert.equal(divida.parcelas[0].situacao, 'pendente');

  // Parcela 2 (+30 dias)
  assert.equal(divida.parcelas[1].numero, 2);
  assert.equal(divida.parcelas[1].dataVencimento, '2026-02-09');

  // Parcela 3 (+30 dias)
  assert.equal(divida.parcelas[2].numero, 3);
  assert.equal(divida.parcelas[2].dataVencimento, '2026-03-11');

  // Parcela 4 (+30 dias)
  assert.equal(divida.parcelas[3].numero, 4);
  assert.equal(divida.parcelas[3].dataVencimento, '2026-04-10');
});

test('gera recorrencia personalizada com intervalo de 15 dias', () => {
  const divida = gerarDividaRecorrente({
    descricao: 'Prestação de Serviço Quinzenal',
    categoria: 'servicos',
    valorCentavos: 50000,
    dataInicio: '2026-02-01',
    quantidadeParcelas: 3,
    intervaloDias: 15,
  });

  assert.equal(divida.parcelas.length, 3);
  assert.equal(divida.parcelas[0].dataVencimento, '2026-02-01');
  assert.equal(divida.parcelas[1].dataVencimento, '2026-02-16');
  assert.equal(divida.parcelas[2].dataVencimento, '2026-03-03');
});

test('rejeita parametros inconsistentes para geracao de divida recorrente', () => {
  assert.throws(
    () =>
      gerarDividaRecorrente({
        descricao: '',
        categoria: 'alimentacao',
        valorCentavos: 1000,
        dataInicio: '2026-01-01',
        quantidadeParcelas: 5,
        intervaloDias: 30,
      }),
    /descrição/,
  );

  assert.throws(
    () =>
      gerarDividaRecorrente({
        descricao: 'Teste',
        categoria: 'alimentacao',
        valorCentavos: -100,
        dataInicio: '2026-01-01',
        quantidadeParcelas: 5,
        intervaloDias: 30,
      }),
    /valor/,
  );
});

test('cadastrarDivida adiciona nova divida preservando imutabilidade do estado', () => {
  const estadoInicial = {
    perfil: { nome: 'Lucas', email: 'lucas@exemplo.com' },
    lancamentos: [],
    dividas: [],
  };

  const novaDivida = gerarDividaRecorrente({
    descricao: 'Internet Fibra',
    categoria: 'servicos',
    valorCentavos: 12000,
    dataInicio: '2026-05-10',
    quantidadeParcelas: 2,
    intervaloDias: 30,
  });

  const atualizado = cadastrarDivida(estadoInicial, novaDivida);
  assert.equal(atualizado.dividas.length, 1);
  assert.equal(atualizado.dividas[0].descricao, 'Internet Fibra');
  assert.equal(estadoInicial.dividas.length, 0); // imutabilidade preservada
});
