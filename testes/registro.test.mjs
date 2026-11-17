import assert from 'node:assert/strict';
import test from 'node:test';

import {
  temErrosRegistro,
  validarCamposRegistro,
} from '../src/dominio/validacao-registro.ts';

test('rejeita nome vazio ou com menos de 2 caracteres', () => {
  const erroVazio = validarCamposRegistro('', 'teste@exemplo.com', '123456', '123456');
  assert.equal(erroVazio.nome, 'Informe seu nome completo.');
  assert.equal(temErrosRegistro(erroVazio), true);

  const erroCurto = validarCamposRegistro('A', 'teste@exemplo.com', '123456', '123456');
  assert.equal(erroCurto.nome, 'O nome deve ter no mínimo 2 caracteres.');
  assert.equal(temErrosRegistro(erroCurto), true);
});

test('rejeita e-mail inválido ou vazio no cadastro', () => {
  const erroFormato = validarCamposRegistro('Carlos Silva', 'invalido', '123456', '123456');
  assert.equal(erroFormato.email, 'Informe um e-mail válido.');
  assert.equal(temErrosRegistro(erroFormato), true);
});

test('rejeita senhas divergentes ou com menos de 6 caracteres', () => {
  const erroCurta = validarCamposRegistro('Carlos Silva', 'carlos@exemplo.com', '123', '123');
  assert.equal(erroCurta.senha, 'A senha deve ter no mínimo 6 caracteres.');
  assert.equal(temErrosRegistro(erroCurta), true);

  const erroDivergente = validarCamposRegistro('Carlos Silva', 'carlos@exemplo.com', 'senha123', 'senha456');
  assert.equal(erroDivergente.confirmacaoSenha, 'As senhas não coincidem.');
  assert.equal(temErrosRegistro(erroDivergente), true);
});

test('aceita cadastro com dados válidos', () => {
  const valido = validarCamposRegistro('Carlos Silva', '  carlos@exemplo.com  ', 'senha123', 'senha123');
  assert.deepEqual(valido, {});
  assert.equal(temErrosRegistro(valido), false);
});
