import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CHAVE_ULTIMA_SINCRONIZACAO,
  URL_API_PADRAO,
  montarPayloadSincronizacao,
  validarRespostaSincronizacao,
} from '../src/dominio/sincronizacao.ts';

test('garante que a chave de ultima sincronizacao seja consistente', () => {
  assert.equal(CHAVE_ULTIMA_SINCRONIZACAO, '@meus-custos:ultima_sincronizacao');
});

test('garante configuracao valida da URL padrao da API NestJS', () => {
  assert.equal(URL_API_PADRAO, 'http://localhost:3001');
});

test('rejeita montar payload sem usuarioId informado', () => {
  assert.throws(() => montarPayloadSincronizacao('', null), /ID do usuário é obrigatório/);
});

test('monta payload de sincronizacao completo com dados financeiros e orcamentos', () => {
  const dadosMock = {
    perfil: { nome: 'Lucas', email: 'lucas@exemplo.com' },
    lancamentos: [
      {
        id: 'lanc-1',
        descricao: 'Salário Desenvolvimento',
        valorCentavos: 800000,
        data: '2026-11-18',
        tipo: 'receita',
        categoria: 'salario',
        situacao: 'recebida',
      },
      {
        id: 'lanc-2',
        descricao: 'Aluguel',
        valorCentavos: 150000,
        data: '2026-11-18',
        tipo: 'despesa',
        categoria: 'moradia',
        origem: { tipo: 'manual' },
        situacao: 'paga',
        dataPagamento: '2026-11-18',
      },
    ],
    dividas: [
      {
        id: 'div-1',
        descricao: 'Notebook Parcelado',
        categoria: 'compras',
        parcelas: [
          {
            id: 'parc-1',
            numero: 1,
            valorCentavos: 50000,
            dataVencimento: '2026-12-10',
            situacao: 'pendente',
          },
        ],
      },
    ],
  };

  const payload = montarPayloadSincronizacao('usr-lucas-123', dadosMock, { moradia: 250000 });

  assert.equal(payload.usuarioId, 'usr-lucas-123');
  assert.equal(payload.lancamentos.length, 2);
  assert.equal(payload.lancamentos[0].valorCentavos, 800000);
  assert.equal(payload.lancamentos[1].dataPagamento, '2026-11-18');
  assert.equal(payload.dividas.length, 1);
  assert.equal(payload.dividas[0].parcelas[0].valorCentavos, 50000);

  const orcamentoMoradia = payload.orcamentos.find((o) => o.categoria === 'moradia');
  assert.ok(orcamentoMoradia);
  assert.equal(orcamentoMoradia.limiteCentavos, 250000);
});

test('valida resposta de sincronizacao com sucesso e totais computados', () => {
  const respostaMock = {
    sucesso: true,
    sincronizadoEm: '2026-11-18T19:30:00.000Z',
    totais: {
      lancamentos: 10,
      dividas: 3,
      orcamentos: 9,
    },
  };

  const validada = validarRespostaSincronizacao(respostaMock);
  assert.equal(validada.sucesso, true);
  assert.equal(validada.totais.lancamentos, 10);
  assert.equal(validada.totais.dividas, 3);
  assert.equal(validada.totais.orcamentos, 9);
});

test('rejeita resposta de sincronizacao malformatada ou vazia', () => {
  assert.throws(() => validarRespostaSincronizacao(null), /inválida/);
  assert.throws(() => validarRespostaSincronizacao({ sucesso: 'sim' }), /incompatível/);
});
