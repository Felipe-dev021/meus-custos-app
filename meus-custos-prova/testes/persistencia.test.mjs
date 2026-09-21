import assert from 'node:assert/strict';
import test from 'node:test';

import { criarDadosDemonstracao } from '../src/dados/demonstracao.ts';
import { restaurarDados, serializarDados } from '../src/dados/persistencia.ts';
import { criarEstadoFinanceiro } from '../src/estado/estado-financeiro.ts';

const dadosIniciais = () => criarDadosDemonstracao(new Date(2026, 8, 21));
const cadastro = {
  tipo: 'cadastrar-lancamento', id: 'receita-persistida', hoje: '2026-09-21',
  entrada: { tipo: 'receita', descricao: 'Trabalho extra', categoria: 'trabalho-extra', valorCentavos: 10000, data: '2026-09-21' },
};
function criarMemoria(conteudo = null) {
  return {
    conteudo, gravacoes: 0,
    async ler() { return this.conteudo; },
    async gravar(valor) { this.conteudo = valor; this.gravacoes += 1; },
  };
}

test('reabrir restaura perfil, receitas e parcelas sem duplicação nem sessão ativa', async () => {
  const memoria = criarMemoria();
  const central = criarEstadoFinanceiro(dadosIniciais(), memoria);
  assert.throws(() => central.executar({ tipo: 'entrar-demonstracao' }), /Aguarde/);
  await central.iniciar();
  central.executar({ tipo: 'entrar-demonstracao' });
  central.executar(cadastro);
  central.executar({ tipo: 'atualizar-perfil', perfil: { nome: 'Ana', email: 'ana@example.com' } });
  const pagar = { tipo: 'pagar-parcela', dividaId: 'demo-divida-curso', parcelaId: 'demo-parcela-curso-2', dataPagamento: '2026-09-21', hoje: '2026-09-21' };
  central.executar(pagar);
  await central.aguardarPersistencia();
  const reaberto = criarEstadoFinanceiro(criarDadosDemonstracao(new Date(2027, 0, 1)), memoria);
  await reaberto.iniciar();
  assert.deepEqual(reaberto.obterEstado().dados, central.obterEstado().dados);
  assert.equal(reaberto.obterEstado().demonstracaoAtiva, false);
  reaberto.executar({ tipo: 'entrar-demonstracao' });
  const gravacoes = memoria.gravacoes;
  reaberto.executar(pagar);
  await reaberto.aguardarPersistencia();
  assert.equal(memoria.gravacoes, gravacoes);
  assert.equal(reaberto.obterEstado().dados.lancamentos.length, 11);
});

test('entrada e saída não gravam a sessão nem apagam dados', async () => {
  const memoria = criarMemoria();
  const central = criarEstadoFinanceiro(dadosIniciais(), memoria);
  await central.iniciar();
  const original = memoria.conteudo;
  central.executar({ tipo: 'entrar-demonstracao' });
  central.executar({ tipo: 'sair-demonstracao' });
  await central.aguardarPersistencia();
  assert.equal(memoria.conteudo, original);
  assert.equal(memoria.gravacoes, 1);
  assert.equal(Object.hasOwn(JSON.parse(original), 'demonstracaoAtiva'), false);
});

test('serialização descarta campos extras e credenciais em todos os registros', () => {
  const dados = dadosIniciais();
  dados.perfil.senha = 'SEGREDO';
  dados.lancamentos[0].senha = 'SEGREDO';
  dados.dividas[0].parcelas[0].senha = 'SEGREDO';
  dados.demonstracaoAtiva = true;
  const conteudo = serializarDados(dados);
  assert.equal(conteudo.includes('SEGREDO'), false);
  assert.deepEqual(restaurarDados(conteudo), dadosIniciais());
});

test('dados inválidos ou de outra versão ficam preservados, sem gravação automática', async () => {
  const originais = JSON.parse(serializarDados(dadosIniciais()));
  const duplicados = structuredClone(originais);
  duplicados.dados.lancamentos.push(duplicados.dados.lancamentos[0]);
  const semVinculo = structuredClone(originais);
  semVinculo.dados.dividas[0].parcelas[0].despesaId = 'ausente';
  const casos = ['{quebrado', JSON.stringify({ ...originais, versao: 2 }),
    JSON.stringify({ versao: 1, dados: {} }), JSON.stringify(duplicados), JSON.stringify(semVinculo)];
  for (const conteudo of casos) {
    const memoria = criarMemoria(conteudo);
    const central = criarEstadoFinanceiro(dadosIniciais(), memoria);
    await central.iniciar();
    assert.equal(central.obterEstado().carregado, false);
    assert.ok(central.obterEstado().erroArmazenamento);
    assert.equal(memoria.conteudo, conteudo);
    assert.equal(memoria.gravacoes, 0);
  }
});

test('falha de leitura pode ser repetida sem substituir o conteúdo salvo', async () => {
  const memoria = criarMemoria(serializarDados(dadosIniciais()));
  let falhar = true;
  const ler = memoria.ler.bind(memoria);
  memoria.ler = async () => { if (falhar) throw new Error('Indisponível'); return ler(); };
  const central = criarEstadoFinanceiro(dadosIniciais(), memoria);
  await central.iniciar();
  assert.ok(central.obterEstado().erroArmazenamento);
  falhar = false;
  await central.tentarNovamente();
  assert.equal(central.obterEstado().carregado, true);
  assert.equal(central.obterEstado().erroArmazenamento, null);
  assert.equal(memoria.gravacoes, 0);
});

test('falha de gravação mantém as mudanças na memória e permite salvá-las novamente', async () => {
  const memoria = criarMemoria(serializarDados(dadosIniciais()));
  const gravar = memoria.gravar.bind(memoria);
  memoria.gravar = async () => { throw new Error('Sem espaço'); };
  const central = criarEstadoFinanceiro(dadosIniciais(), memoria);
  await central.iniciar();
  central.executar({ tipo: 'entrar-demonstracao' });
  central.executar(cadastro);
  await central.aguardarPersistencia();
  assert.ok(central.obterEstado().erroArmazenamento);
  assert.equal(central.obterEstado().dados.lancamentos.length, 10);
  assert.equal(restaurarDados(memoria.conteudo).lancamentos.length, 9);
  memoria.gravar = gravar;
  await central.tentarNovamente();
  assert.equal(central.obterEstado().erroArmazenamento, null);
  assert.equal(central.obterEstado().salvando, false);
  assert.equal(restaurarDados(memoria.conteudo).lancamentos.length, 10);
});

test('gravações são sequenciais e a última atualização prevalece', async () => {
  const memoria = criarMemoria(serializarDados(dadosIniciais()));
  const gravar = memoria.gravar.bind(memoria);
  let liberar;
  let simultaneas = 0;
  let maximo = 0;
  memoria.gravar = async (conteudo) => {
    simultaneas += 1;
    maximo = Math.max(maximo, simultaneas);
    if (!liberar) await new Promise((resolver) => { liberar = resolver; });
    await gravar(conteudo);
    simultaneas -= 1;
  };
  const central = criarEstadoFinanceiro(dadosIniciais(), memoria);
  await central.iniciar();
  central.executar({ tipo: 'entrar-demonstracao' });
  central.executar(cadastro);
  await Promise.resolve();
  central.executar({ ...cadastro, id: 'segunda-receita' });
  assert.equal(central.obterEstado().salvando, true);
  liberar();
  await central.aguardarPersistencia();
  assert.equal(maximo, 1);
  assert.equal(memoria.gravacoes, 2);
  assert.equal(restaurarDados(memoria.conteudo).lancamentos.length, 11);
  assert.equal(central.obterEstado().salvando, false);
});

test('inicializações concorrentes fazem apenas uma leitura', async () => {
  let leituras = 0;
  let liberar;
  const memoria = criarMemoria(serializarDados(dadosIniciais()));
  memoria.ler = () => {
    leituras += 1;
    return new Promise((resolver) => { liberar = () => resolver(memoria.conteudo); });
  };
  const central = criarEstadoFinanceiro(dadosIniciais(), memoria);
  const primeira = central.iniciar();
  const segunda = central.iniciar();
  liberar();
  await Promise.all([primeira, segunda]);
  assert.equal(leituras, 1);
  assert.equal(memoria.gravacoes, 0);
});
