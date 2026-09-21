import assert from 'node:assert/strict';
import test from 'node:test';

import { criarDadosDemonstracao } from '../src/dados/demonstracao.ts';
import { calcularResumoFinanceiro, listarReceitas } from '../src/dominio/consultas-financeiras.ts';
import { criarEstadoFinanceiro } from '../src/estado/estado-financeiro.ts';

const criarCentral = () => criarEstadoFinanceiro(criarDadosDemonstracao(new Date(2026, 8, 21)));
const cadastro = {
  tipo: 'cadastrar-lancamento', id: 'nova-receita', hoje: '2026-09-21',
  entrada: { tipo: 'receita', descricao: 'Trabalho extra', categoria: 'trabalho-extra', valorCentavos: 5000, data: '2026-09-21' },
};

test('entrada e saída da demonstração preservam lançamentos e perfil sem credenciais', () => {
  const central = criarCentral();
  assert.equal(central.obterEstado().demonstracaoAtiva, false);
  central.executar({ tipo: 'entrar-demonstracao' });
  central.executar(cadastro);
  central.executar({ tipo: 'atualizar-perfil', perfil: { nome: '  Ana Silva ', email: ' ANA@example.com ', senha: 'nao-salvar' } });
  const dados = central.obterEstado().dados;
  central.executar({ tipo: 'sair-demonstracao' });
  assert.equal(central.obterEstado().demonstracaoAtiva, false);
  assert.equal(central.obterEstado().dados, dados);
  central.executar({ tipo: 'entrar-demonstracao' });
  assert.equal(central.obterEstado().dados, dados);
  assert.deepEqual(dados.perfil, { nome: 'Ana Silva', email: 'ana@example.com' });
  assert.equal(JSON.stringify(central.obterEstado()).includes('nao-salvar'), false);
});

test('dois consumidores recebem o mesmo estado atualizado e podem cancelar a assinatura', () => {
  const central = criarCentral();
  let saldo;
  let receitas;
  let notificacoes = 0;
  const cancelar = central.assinar(() => {
    saldo = calcularResumoFinanceiro(central.obterEstado().dados.lancamentos).saldoDisponivel;
    notificacoes += 1;
  });
  central.assinar(() => { receitas = listarReceitas(central.obterEstado().dados.lancamentos); });
  central.executar({ tipo: 'entrar-demonstracao' });
  central.executar(cadastro);
  assert.equal(saldo, 379350);
  assert.equal(receitas.length, 3);
  assert.equal(receitas[0].id, 'nova-receita');
  assert.equal(notificacoes, 2);
  cancelar();
  central.executar({ tipo: 'sair-demonstracao' });
  assert.equal(notificacoes, 2);
});

test('operações consecutivas não perdem atualizações nem duplicam parcelas', () => {
  const central = criarCentral();
  central.executar({ tipo: 'entrar-demonstracao' });
  central.executar(cadastro);
  central.executar({ ...cadastro, id: 'segunda-receita' });
  central.executar({ tipo: 'pagar-despesa', id: 'demo-despesa-energia', dataPagamento: '2026-09-21', hoje: '2026-09-21' });
  const parcela = { tipo: 'pagar-parcela', dividaId: 'demo-divida-curso', parcelaId: 'demo-parcela-curso-2', dataPagamento: '2026-09-21', hoje: '2026-09-21' };
  central.executar(parcela);
  const estado = central.obterEstado();
  central.executar(parcela);
  assert.equal(central.obterEstado(), estado);
  assert.equal(estado.dados.lancamentos.length, 12);
  assert.equal(calcularResumoFinanceiro(estado.dados.lancamentos).saldoDisponivel, 346360);
});

test('ações inválidas preservam o estado e não notificam consumidores', () => {
  const central = criarCentral();
  const inicial = central.obterEstado();
  assert.throws(() => central.executar(cadastro), /Entre na demonstração/);
  assert.equal(central.obterEstado(), inicial);
  central.executar({ tipo: 'entrar-demonstracao' });
  const ativo = central.obterEstado();
  let notificacoes = 0;
  central.assinar(() => { notificacoes += 1; });
  for (const perfil of [{ nome: '', email: 'ana@example.com' }, { nome: 'Ana', email: 'invalido' }]) {
    assert.throws(() => central.executar({ tipo: 'atualizar-perfil', perfil }));
  }
  assert.throws(() => central.executar({ ...cadastro, entrada: { ...cadastro.entrada, valorCentavos: -1 } }));
  assert.equal(central.obterEstado(), ativo);
  assert.equal(notificacoes, 0);
});
