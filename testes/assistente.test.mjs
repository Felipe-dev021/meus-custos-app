import test from 'node:test';
import assert from 'node:assert/strict';

import {
  obterMensagemInicial,
  responderPerguntaFinanceira,
  SUGESTOES_PERGUNTAS,
} from '../src/dominio/assistente.ts';

const contextoMock = {
  nomeUsuario: 'Marina',
  resumo: {
    receitasRecebidas: 605000,
    despesasPagas: 230650,
    despesasPendentes: 24980,
    saldoDisponivel: 374350,
    saldoPrevisto: 349370,
  },
  resumoDividas: {
    saldoDevedorTotal: 44000,
    totalDividas: 66000,
    totalPago: 22000,
    quantidadeDividas: 1,
    quantidadeQuitadas: 0,
  },
  gastosPorCategoria: [
    { categoria: 'moradia', valorCentavos: 140000 },
    { categoria: 'alimentacao', valorCentavos: 38650 },
  ],
  receitas: [
    {
      id: 'r1',
      tipo: 'receita',
      descricao: 'Salário mensal',
      categoria: 'salario',
      valorCentavos: 520000,
      data: '2026-09-05',
      situacao: 'recebida',
    },
    {
      id: 'r2',
      tipo: 'receita',
      descricao: 'Projeto extra',
      categoria: 'trabalho-extra',
      valorCentavos: 85000,
      data: '2026-09-10',
      situacao: 'recebida',
    },
  ],
  despesas: [
    {
      id: 'd1',
      tipo: 'despesa',
      descricao: 'Aluguel',
      categoria: 'moradia',
      valorCentavos: 140000,
      data: '2026-09-06',
      situacao: 'paga',
      dataPagamento: '2026-09-06',
      origem: { tipo: 'manual' },
    },
    {
      id: 'd2',
      tipo: 'despesa',
      descricao: 'Energia',
      categoria: 'moradia',
      valorCentavos: 15990,
      data: '2026-09-25',
      situacao: 'pendente',
      origem: { tipo: 'manual' },
    },
  ],
};

test('obterMensagemInicial inclui o nome do usuário', () => {
  const msg = obterMensagemInicial('Marina');
  assert.equal(msg.remetente, 'assistente');
  assert.match(msg.texto, /Marina/);
});

test('responde corretamente sobre saldo disponível e previsão', () => {
  const resposta = responderPerguntaFinanceira('Qual é o meu saldo?', contextoMock);
  assert.match(resposta, /3\.743,50/);
  assert.match(resposta, /3\.493,70/);
});

test('responde corretamente sobre receitas recebidas', () => {
  const resposta = responderPerguntaFinanceira('Quanto recebi de renda?', contextoMock);
  assert.match(resposta, /6\.050,00/);
  assert.match(resposta, /2 lançamento/);
});

test('responde corretamente sobre a maior despesa e categoria', () => {
  const resposta = responderPerguntaFinanceira('Qual foi a minha maior despesa?', contextoMock);
  assert.match(resposta, /Aluguel/);
  assert.match(resposta, /1\.400,00/);
  assert.match(resposta, /Moradia/);
});

test('responde corretamente sobre a situação das dívidas', () => {
  const resposta = responderPerguntaFinanceira('Como estão as minhas dívidas?', contextoMock);
  assert.match(resposta, /440,00/);
  assert.match(resposta, /220,00/);
});

test('responde corretamente sobre a previsão de fim de mês', () => {
  const resposta = responderPerguntaFinanceira('Qual a previsão para o fim do mês?', contextoMock);
  assert.match(resposta, /3\.493,70/);
});

test('fornece resposta educativa e amigável para perguntas fora de escopo', () => {
  const resposta = responderPerguntaFinanceira('Qual a cotação do dólar hoje?', contextoMock);
  assert.match(resposta, /assistente demonstrativo local/);
  assert.match(resposta, /saldo disponível/);
});

test('todas as perguntas sugeridas possuem respostas sem erro', () => {
  for (const pergunta of SUGESTOES_PERGUNTAS) {
    const resposta = responderPerguntaFinanceira(pergunta, contextoMock);
    assert.equal(typeof resposta, 'string');
    assert.ok(resposta.length > 20);
  }
});
