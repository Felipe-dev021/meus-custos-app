import test from 'node:test';
import assert from 'node:assert/strict';

import { coresEscuro, coresClaro, CHAVE_TEMA } from '../src/tema/index.ts';

test('garante que a chave de persistência de tema seja consistente', () => {
  assert.equal(CHAVE_TEMA, '@meus-custos/tema');
});

test('garante que o tema escuro use preto absoluto #000000 como fundo', () => {
  assert.equal(coresEscuro.fundo, '#000000');
});

test('garante que as paletas clara e escura possuam exatamente as mesmas chaves de cores', () => {
  const chavesEscuro = Object.keys(coresEscuro).sort();
  const chavesClaro = Object.keys(coresClaro).sort();

  assert.deepEqual(chavesEscuro, chavesClaro);
});

test('garante contraste legível entre textos e fundos nos dois temas', () => {
  // No tema escuro: texto claro sobre fundo escuro
  assert.equal(coresEscuro.fundo, '#000000');
  assert.equal(coresEscuro.texto, '#fafafa');

  // No tema claro: texto escuro sobre fundo claro
  assert.equal(coresClaro.fundo, '#f4f4f5');
  assert.equal(coresClaro.texto, '#09090b');

  // Verde primário deve manter distinção
  assert.equal(typeof coresEscuro.primaria, 'string');
  assert.equal(typeof coresClaro.primaria, 'string');
  assert.notEqual(coresEscuro.primaria, coresClaro.fundo);
  assert.notEqual(coresClaro.primaria, coresClaro.fundo);
});

test('simula leitura e gravação da preferência de tema no armazenamento', async () => {
  const memoria = new Map();
  const armazenamento = {
    ler: (chave) => Promise.resolve(memoria.get(chave) ?? null),
    gravar: (chave, valor) => {
      memoria.set(chave, valor);
      return Promise.resolve();
    },
  };

  // Sem preferência salva -> deve adotar 'escuro'
  const inicial = (await armazenamento.ler(CHAVE_TEMA)) ?? 'escuro';
  assert.equal(inicial, 'escuro');

  // Alterna para 'claro' e persiste
  await armazenamento.gravar(CHAVE_TEMA, 'claro');
  const salvo = await armazenamento.ler(CHAVE_TEMA);
  assert.equal(salvo, 'claro');

  // Alterna de volta para 'escuro' e persiste
  await armazenamento.gravar(CHAVE_TEMA, 'escuro');
  const restaurado = await armazenamento.ler(CHAVE_TEMA);
  assert.equal(restaurado, 'escuro');
});
