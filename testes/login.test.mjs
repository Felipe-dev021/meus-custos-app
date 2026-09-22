import assert from 'node:assert/strict';
import test from 'node:test';

import { temErrosLogin, validarCredenciaisLogin } from '../src/dominio/validacao-login.ts';

test('rejeita e-mail vazio ou em formato inválido', () => {
  const erroVazio = validarCredenciaisLogin('', '123456');
  assert.equal(erroVazio.email, 'Informe seu e-mail.');
  assert.equal(temErrosLogin(erroVazio), true);

  const erroFormato = validarCredenciaisLogin('usuario-sem-arroba', '123456');
  assert.equal(erroFormato.email, 'Informe um e-mail válido.');
  assert.equal(temErrosLogin(erroFormato), true);

  const erroEspacos = validarCredenciaisLogin('   ', '123456');
  assert.equal(erroEspacos.email, 'Informe seu e-mail.');
});

test('rejeita senha vazia ou com menos de 6 caracteres', () => {
  const erroVazia = validarCredenciaisLogin('teste@exemplo.com', '');
  assert.equal(erroVazia.senha, 'Informe sua senha.');
  assert.equal(temErrosLogin(erroVazia), true);

  const erroCurta = validarCredenciaisLogin('teste@exemplo.com', '123');
  assert.equal(erroCurta.senha, 'A senha deve ter no mínimo 6 caracteres.');
  assert.equal(temErrosLogin(erroCurta), true);
});

test('aceita credenciais válidas com limpeza de espaços no e-mail', () => {
  const valido = validarCredenciaisLogin('  usuario@exemplo.com  ', 'senhaSegura123');
  assert.deepEqual(valido, {});
  assert.equal(temErrosLogin(valido), false);
});

