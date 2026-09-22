import test from 'node:test';
import assert from 'node:assert/strict';

import { criarEstadoFinanceiro } from '../src/estado/estado-financeiro.ts';

test('atualizar perfil valida nome e e-mail e preserva dados', () => {
  const central = criarEstadoFinanceiro();
  central.executar({ tipo: 'entrar-demonstracao' });

  // Nome inválido (vazio)
  assert.throws(
    () => central.executar({ tipo: 'atualizar-perfil', perfil: { nome: '', email: 'teste@exemplo.com' } }),
    /nome/,
  );

  // E-mail inválido
  assert.throws(
    () => central.executar({ tipo: 'atualizar-perfil', perfil: { nome: 'Lucas', email: 'email-invalido' } }),
    /e-mail/,
  );

  // Sucesso
  central.executar({
    tipo: 'atualizar-perfil',
    perfil: { nome: 'Lucas Marins', email: 'lucas.marins@exemplo.com' },
  });

  const estado = central.obterEstado();
  assert.equal(estado.dados.perfil.nome, 'Lucas Marins');
  assert.equal(estado.dados.perfil.email, 'lucas.marins@exemplo.com');

  // Lançamentos e dívidas permanecem intactos
  assert.ok(estado.dados.lancamentos.length > 0);
  assert.ok(estado.dados.dividas.length > 0);
});

test('sair da demonstracao desativa sessao sem apagar perfil salvo', () => {
  const central = criarEstadoFinanceiro();
  central.executar({ tipo: 'entrar-demonstracao' });

  central.executar({
    tipo: 'atualizar-perfil',
    perfil: { nome: 'Felipe Dev', email: 'felipe@exemplo.com' },
  });

  assert.equal(central.obterEstado().demonstracaoAtiva, true);

  central.executar({ tipo: 'sair-demonstracao' });
  const posSaida = central.obterEstado();

  assert.equal(posSaida.demonstracaoAtiva, false);
  assert.equal(posSaida.dados.perfil.nome, 'Felipe Dev');
  assert.equal(posSaida.dados.perfil.email, 'felipe@exemplo.com');
});
