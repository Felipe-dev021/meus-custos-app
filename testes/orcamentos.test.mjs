import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calcularStatusOrcamentos,
  LIMITES_PADRAO_CATEGORIAS,
} from '../src/dominio/orcamentos.ts';

test('calcula orçamento inicial com todos os limites padrão', () => {
  const resumo = calcularStatusOrcamentos([]);
  assert.equal(resumo.totalGastoCentavos, 0);
  assert.ok(resumo.totalOrcadoCentavos > 0);
  assert.equal(resumo.categoriasExcedidas, 0);
  assert.equal(resumo.categoriasDentroMeta, Object.keys(LIMITES_PADRAO_CATEGORIAS).length);
});

test('identifica corretamente categoria em alerta e categoria excedida', () => {
  const lancamentos = [
    {
      id: '1',
      tipo: 'despesa',
      descricao: 'Aluguel caro',
      valorCentavos: 210000, // Limite moradia é 200000 -> Excedido (105%)
      data: '2026-11-01',
      categoria: 'moradia',
      situacao: 'paga',
      origem: { tipo: 'manual' },
    },
    {
      id: '2',
      tipo: 'despesa',
      descricao: 'Mercado grande',
      valorCentavos: 130000, // Limite alimentacao é 150000 -> 86.6% -> Alerta
      data: '2026-11-05',
      categoria: 'alimentacao',
      situacao: 'paga',
      origem: { tipo: 'manual' },
    },
    {
      id: '3',
      tipo: 'despesa',
      descricao: 'Farmácia',
      valorCentavos: 5000, // Limite saude é 40000 -> 12.5% -> Dentro
      data: '2026-11-08',
      categoria: 'saude',
      situacao: 'paga',
      origem: { tipo: 'manual' },
    },
  ];

  const resumo = calcularStatusOrcamentos(lancamentos);

  assert.equal(resumo.categoriasExcedidas, 1);
  assert.equal(resumo.categoriasAlerta, 1);

  const itemMoradia = resumo.itens.find((i) => i.categoria === 'moradia');
  assert.ok(itemMoradia);
  assert.equal(itemMoradia.status, 'excedido');
  assert.equal(itemMoradia.saldoRestanteCentavos, -10000);

  const itemAlimentacao = resumo.itens.find((i) => i.categoria === 'alimentacao');
  assert.ok(itemAlimentacao);
  assert.equal(itemAlimentacao.status, 'alerta');

  const itemSaude = resumo.itens.find((i) => i.categoria === 'saude');
  assert.ok(itemSaude);
  assert.equal(itemSaude.status, 'dentro');
});

test('aceita limites personalizados por categoria', () => {
  const limitesCustom = {
    lazer: 10000, // Limite de apenas R$ 100,00
  };

  const lancamentos = [
    {
      id: '1',
      tipo: 'despesa',
      descricao: 'Cinema',
      valorCentavos: 12000, // R$ 120,00 -> Ultrapassa os R$ 100
      data: '2026-11-10',
      categoria: 'lazer',
      situacao: 'paga',
      origem: { tipo: 'manual' },
    },
  ];

  const resumo = calcularStatusOrcamentos(lancamentos, limitesCustom);
  const itemLazer = resumo.itens.find((i) => i.categoria === 'lazer');
  assert.ok(itemLazer);
  assert.equal(itemLazer.limiteCentavos, 10000);
  assert.equal(itemLazer.status, 'excedido');
});
