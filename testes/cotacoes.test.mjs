import assert from 'node:assert/strict';
import test from 'node:test';

import {
  COTACOES_CONTINGENCIA,
  converterMoedaParaReais,
  converterReaisParaMoeda,
  normalizarRespostaAwesomeApi,
} from '../src/servicos/apiCotacoes.ts';

test('normaliza resposta da AwesomeAPI corretamente', () => {
  const mockApi = {
    USDBRL: {
      code: 'USD',
      codein: 'BRL',
      name: 'Dólar Americano/Real Brasileiro',
      high: '5.88',
      low: '5.81',
      pctChange: '0.45',
      bid: '5.85',
      ask: '5.86',
      create_date: '2026-11-17 14:00:00',
    },
    EURBRL: {
      code: 'EUR',
      codein: 'BRL',
      name: 'Euro/Real Brasileiro',
      high: '6.22',
      low: '6.15',
      pctChange: '-0.20',
      bid: '6.19',
      ask: '6.20',
      create_date: '2026-11-17 14:00:00',
    },
  };

  const resultado = normalizarRespostaAwesomeApi(mockApi);
  assert.equal(resultado.length, 2);
  assert.equal(resultado[0].codigo, 'USD');
  assert.equal(resultado[0].valorCompra, 5.85);
  assert.equal(resultado[0].variacaoPercentual, 0.45);
  assert.equal(resultado[1].codigo, 'EUR');
  assert.equal(resultado[1].valorCompra, 6.19);
});

test('retorna contingência para dados vazios ou corrompidos', () => {
  const vazio = normalizarRespostaAwesomeApi({});
  assert.deepEqual(vazio, COTACOES_CONTINGENCIA);
});

test('calcula conversão de reais para moeda estrangeira com precisão', () => {
  // R$ 100,00 (10000 centavos) com dólar a R$ 5,00 = US$ 20,00
  const valorConvertido = converterReaisParaMoeda(10000, 5.0);
  assert.equal(valorConvertido, 20.0);

  // Valor com cotação inválida não gera erro
  assert.equal(converterReaisParaMoeda(10000, 0), 0);
  assert.equal(converterReaisParaMoeda(10000, -1), 0);
});

test('calcula conversão de moeda estrangeira para reais', () => {
  // US$ 50,00 com dólar a R$ 5,80 = R$ 290,00
  const valorReais = converterMoedaParaReais(50, 5.8);
  assert.equal(valorReais, 290.0);

  assert.equal(converterMoedaParaReais(0, 5.8), 0);
});
