import test from 'node:test';
import assert from 'node:assert/strict';

import { calcularResumoDividas } from '../src/dominio/consultas-financeiras.ts';
import { pagarParcela } from '../src/dominio/operacoes-financeiras.ts';

const hoje = '2026-09-22';
const dadosExemplo = () => ({
  lancamentos: [],
  dividas: [
    {
      id: 'divida-1',
      descricao: 'Curso de Design',
      categoria: 'educacao',
      parcelas: [
        {
          id: 'p1',
          numero: 1,
          valorCentavos: 10000,
          dataVencimento: '2026-09-01',
          situacao: 'paga',
          dataPagamento: '2026-09-01',
          despesaId: 'desp-p1',
        },
        {
          id: 'p2',
          numero: 2,
          valorCentavos: 10000,
          dataVencimento: '2026-10-01',
          situacao: 'pendente',
        },
        {
          id: 'p3',
          numero: 3,
          valorCentavos: 10000,
          dataVencimento: '2026-11-01',
          situacao: 'pendente',
        },
      ],
    },
    {
      id: 'divida-2',
      descricao: 'Notebook',
      categoria: 'servicos',
      parcelas: [
        {
          id: 'note-1',
          numero: 1,
          valorCentavos: 25000,
          dataVencimento: '2026-08-15',
          situacao: 'paga',
          dataPagamento: '2026-08-15',
          despesaId: 'desp-note-1',
        },
      ],
    },
  ],
  perfil: { nome: 'Lucas', email: 'lucas@example.com' },
});

test('calcularResumoDividas consolida saldo devedor, total pago e quitadas', () => {
  const dados = dadosExemplo();
  const resumo = calcularResumoDividas(dados.dividas);

  assert.equal(resumo.quantidadeDividas, 2);
  assert.equal(resumo.quantidadeQuitadas, 1); // divida-2 quitada (todas as parcelas pagas)
  assert.equal(resumo.totalDividas, 55000); // 30000 (divida 1) + 25000 (divida 2)
  assert.equal(resumo.totalPago, 35000); // 10000 (p1) + 25000 (note-1)
  assert.equal(resumo.saldoDevedorTotal, 20000); // p2 (10000) + p3 (10000)
});

test('pagamento de parcela reduz saldo devedor e quita divida quando completa', () => {
  let estado = {
    ...dadosExemplo(),
    lancamentos: [
      {
        id: 'desp-p1',
        tipo: 'despesa',
        descricao: 'Curso de Design · Parcela 1 de 3',
        valorCentavos: 10000,
        categoria: 'educacao',
        data: '2026-09-01',
        situacao: 'paga',
        dataPagamento: '2026-09-01',
        origem: { tipo: 'parcela', dividaId: 'divida-1', parcelaId: 'p1' },
      },
      {
        id: 'desp-note-1',
        tipo: 'despesa',
        descricao: 'Notebook · Parcela 1 de 1',
        valorCentavos: 25000,
        categoria: 'servicos',
        data: '2026-08-15',
        situacao: 'paga',
        dataPagamento: '2026-08-15',
        origem: { tipo: 'parcela', dividaId: 'divida-2', parcelaId: 'note-1' },
      },
    ],
  };

  // Pagar p2
  estado = pagarParcela(estado, 'divida-1', 'p2', hoje, hoje);
  let resumo = calcularResumoDividas(estado.dividas);
  assert.equal(resumo.saldoDevedorTotal, 10000);
  assert.equal(resumo.totalPago, 45000);
  assert.equal(resumo.quantidadeQuitadas, 1);

  // Pagar p3 (última parcela)
  estado = pagarParcela(estado, 'divida-1', 'p3', hoje, hoje);
  resumo = calcularResumoDividas(estado.dividas);
  assert.equal(resumo.saldoDevedorTotal, 0);
  assert.equal(resumo.totalPago, 55000);
  assert.equal(resumo.quantidadeQuitadas, 2); // Ambas quitadas!
});
