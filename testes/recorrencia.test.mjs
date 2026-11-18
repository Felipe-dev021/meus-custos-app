import assert from 'node:assert/strict';
import test from 'node:test';

import {
  cadastrarDivida,
  cadastrarLancamentosMultiplos,
} from '../src/dominio/operacoes-financeiras.ts';
import {
  INTERVALOS_PADRAO_DIAS,
  gerarDividaRecorrente,
  gerarReceitasRecorrentes,
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

test('gera receitas recorrentes de salario mensal a cada 30 dias com numeracao sequencial', () => {
  const receitas = gerarReceitasRecorrentes({
    descricao: 'Salário Mensal',
    categoria: 'salario',
    valorCentavos: 500000,
    dataInicio: '2026-01-05',
    quantidadeRepeticoes: 3,
    intervaloDias: 30,
  });

  assert.equal(receitas.length, 3);

  // Ocorrência 1
  assert.equal(receitas[0].descricao, 'Salário Mensal (1/3)');
  assert.equal(receitas[0].categoria, 'salario');
  assert.equal(receitas[0].valorCentavos, 500000);
  assert.equal(receitas[0].data, '2026-01-05');
  assert.equal(receitas[0].tipo, 'receita');
  assert.equal(receitas[0].situacao, 'recebida');
  assert.ok(receitas[0].id);

  // Ocorrência 2 (+30 dias)
  assert.equal(receitas[1].descricao, 'Salário Mensal (2/3)');
  assert.equal(receitas[1].data, '2026-02-04');

  // Ocorrência 3 (+30 dias)
  assert.equal(receitas[2].descricao, 'Salário Mensal (3/3)');
  assert.equal(receitas[2].data, '2026-03-06');
});

test('gera receitas recorrentes com intervalo quinzenal de 15 dias', () => {
  const receitas = gerarReceitasRecorrentes({
    descricao: 'Adiantamento Freelance',
    categoria: 'outros',
    valorCentavos: 120000,
    dataInicio: '2026-04-01',
    quantidadeRepeticoes: 2,
    intervaloDias: 15,
  });

  assert.equal(receitas.length, 2);
  assert.equal(receitas[0].descricao, 'Adiantamento Freelance (1/2)');
  assert.equal(receitas[0].data, '2026-04-01');
  assert.equal(receitas[1].descricao, 'Adiantamento Freelance (2/2)');
  assert.equal(receitas[1].data, '2026-04-16');
});

test('rejeita parametros inconsistentes para geracao de receitas recorrentes', () => {
  assert.throws(
    () =>
      gerarReceitasRecorrentes({
        descricao: '',
        categoria: 'salario',
        valorCentavos: 1000,
        dataInicio: '2026-01-01',
        quantidadeRepeticoes: 3,
        intervaloDias: 30,
      }),
    /descrição/,
  );

  assert.throws(
    () =>
      gerarReceitasRecorrentes({
        descricao: 'Salário',
        categoria: 'salario',
        valorCentavos: 0,
        dataInicio: '2026-01-01',
        quantidadeRepeticoes: 3,
        intervaloDias: 30,
      }),
    /valor/,
  );

  assert.throws(
    () =>
      gerarReceitasRecorrentes({
        descricao: 'Salário',
        categoria: 'salario',
        valorCentavos: 5000,
        dataInicio: '2026-01-01',
        quantidadeRepeticoes: 0,
        intervaloDias: 30,
      }),
    /quantidade de repetições/,
  );

  assert.throws(
    () =>
      gerarReceitasRecorrentes({
        descricao: 'Salário',
        categoria: 'salario',
        valorCentavos: 5000,
        dataInicio: '2026-01-01',
        quantidadeRepeticoes: 3,
        intervaloDias: 0,
      }),
    /intervalo entre recebimentos/,
  );
});

test('cadastrarLancamentosMultiplos cadastra multiplas receitas recorrentes preservando imutabilidade', () => {
  const dadosIniciais = {
    lancamentos: [
      {
        id: 'lanc-1',
        descricao: 'Saldo Inicial',
        categoria: 'outros',
        valorCentavos: 10000,
        data: '2026-01-01',
        tipo: 'receita',
        situacao: 'recebida',
      },
    ],
    dividas: [],
  };

  const novasReceitas = gerarReceitasRecorrentes({
    descricao: 'Consultoria Mensal',
    categoria: 'servicos',
    valorCentavos: 250000,
    dataInicio: '2026-02-01',
    quantidadeRepeticoes: 2,
    intervaloDias: 30,
  });

  const atualizado = cadastrarLancamentosMultiplos(dadosIniciais, novasReceitas);

  assert.equal(atualizado.lancamentos.length, 3);
  assert.equal(atualizado.lancamentos[1].descricao, 'Consultoria Mensal (1/2)');
  assert.equal(atualizado.lancamentos[2].descricao, 'Consultoria Mensal (2/2)');
  assert.ok(atualizado.lancamentos[1].id);
  assert.ok(atualizado.lancamentos[2].id);
  // Imutabilidade
  assert.equal(dadosIniciais.lancamentos.length, 1);
});
