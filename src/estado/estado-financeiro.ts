import { criarDadosDemonstracao } from '../dados/demonstracao.ts';
import { restaurarDados, serializarDados, type ArmazenamentoFinanceiro } from '../dados/persistencia.ts';
import type { DadosFinanceiros, DataCivil, Perfil } from '../dominio/financeiro';
import { cadastrarLancamento, pagarDespesa, pagarParcela, type NovoLancamento } from '../dominio/operacoes-financeiras.ts';

export type EstadoFinanceiro = {
  dados: DadosFinanceiros;
  demonstracaoAtiva: boolean;
  carregado: boolean;
  salvando: boolean;
  erroArmazenamento: string | null;
};

export type AcaoFinanceira =
  | { tipo: 'entrar-demonstracao' }
  | { tipo: 'sair-demonstracao' }
  | { tipo: 'atualizar-perfil'; perfil: Perfil }
  | { tipo: 'cadastrar-lancamento'; entrada: NovoLancamento; id: string; hoje: DataCivil }
  | { tipo: 'pagar-despesa'; id: string; dataPagamento: DataCivil; hoje: DataCivil }
  | { tipo: 'pagar-parcela'; dividaId: string; parcelaId: string; dataPagamento: DataCivil; hoje: DataCivil };

function validarPerfil(perfil: Perfil): Perfil {
  const nome = perfil.nome.trim();
  const email = perfil.email.trim().toLowerCase();
  if (!nome || nome.length > 80) throw new Error('Informe um nome de até 80 caracteres.');
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Informe um e-mail válido.');
  }
  // Copia somente os campos permitidos. Credenciais não fazem parte do perfil.
  return { nome, email };
}

/** Todas as alterações passam por aqui; erros preservam o estado anterior. */
function aplicarAcao(estado: EstadoFinanceiro, acao: AcaoFinanceira): EstadoFinanceiro {
  if (acao.tipo === 'entrar-demonstracao') {
    return estado.demonstracaoAtiva ? estado : { ...estado, demonstracaoAtiva: true };
  }
  if (acao.tipo === 'sair-demonstracao') {
    return estado.demonstracaoAtiva ? { ...estado, demonstracaoAtiva: false } : estado;
  }
  if (!estado.demonstracaoAtiva) throw new Error('Entre na demonstração para alterar os dados.');

  let dados: DadosFinanceiros;
  switch (acao.tipo) {
    case 'atualizar-perfil':
      dados = { ...estado.dados, perfil: validarPerfil(acao.perfil) };
      break;
    case 'cadastrar-lancamento':
      dados = cadastrarLancamento(estado.dados, acao.entrada, acao.id, acao.hoje);
      break;
    case 'pagar-despesa':
      dados = pagarDespesa(estado.dados, acao.id, acao.dataPagamento, acao.hoje);
      break;
    case 'pagar-parcela':
      dados = pagarParcela(estado.dados, acao.dividaId, acao.parcelaId, acao.dataPagamento, acao.hoje);
      break;
  }
  return dados === estado.dados ? estado : { ...estado, dados };
}

/** Uma instância por aplicativo. Sair da demonstração não apaga os dados. */
export function criarEstadoFinanceiro(dados = criarDadosDemonstracao(), armazenamento?: ArmazenamentoFinanceiro) {
  let estado: EstadoFinanceiro = {
    dados, demonstracaoAtiva: false, carregado: !armazenamento, salvando: false, erroArmazenamento: null,
  };
  const ouvintes = new Set<() => void>();
  let leitura: Promise<void> | null = null;
  let fila = Promise.resolve();
  let revisao = 0;

  function publicar(proximo: EstadoFinanceiro) {
    estado = proximo;
    ouvintes.forEach((ouvinte) => ouvinte());
  }

  function gravar() {
    if (!armazenamento) return Promise.resolve();
    const conteudo = serializarDados(estado.dados);
    const revisaoAtual = ++revisao;
    publicar({ ...estado, salvando: true, erroArmazenamento: null });
    fila = fila.then(() => armazenamento.gravar(conteudo)).then(() => {
      if (revisaoAtual === revisao) publicar({ ...estado, salvando: false, erroArmazenamento: null });
    }).catch(() => {
      if (revisaoAtual === revisao) publicar({
        ...estado, salvando: false,
        erroArmazenamento: 'Não foi possível salvar no aparelho. Mantenha o aplicativo aberto e tente novamente.',
      });
    });
    return fila;
  }

  function iniciar(): Promise<void> {
    if (!armazenamento || estado.carregado) return fila;
    if (leitura) return leitura;
    publicar({ ...estado, erroArmazenamento: null });
    leitura = (async () => {
      try {
        const conteudo = await armazenamento.ler();
        const restaurados = conteudo === null ? estado.dados : restaurarDados(conteudo);
        publicar({ ...estado, dados: restaurados, carregado: true, demonstracaoAtiva: false });
        if (conteudo === null) await gravar();
      } catch {
        publicar({ ...estado, erroArmazenamento: 'Não foi possível carregar os dados salvos. Eles foram preservados. Tente novamente.' });
      } finally {
        leitura = null;
      }
    })();
    return leitura;
  }

  return {
    obterEstado: () => estado,
    iniciar,
    tentarNovamente: () => estado.carregado ? gravar() : iniciar(),
    aguardarPersistencia: () => fila,
    assinar(ouvinte: () => void) {
      ouvintes.add(ouvinte);
      return () => { ouvintes.delete(ouvinte); };
    },
    executar(acao: AcaoFinanceira) {
      if (!estado.carregado) throw new Error('Aguarde o carregamento dos dados.');
      const proximo = aplicarAcao(estado, acao);
      if (proximo === estado) return;
      const dadosAlterados = proximo.dados !== estado.dados;
      if (armazenamento && dadosAlterados) serializarDados(proximo.dados);
      publicar(proximo);
      if (dadosAlterados) void gravar();
    },
  };
}
