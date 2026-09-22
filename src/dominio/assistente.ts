import type { GastoPorCategoria, ResumoDividas, ResumoFinanceiro } from './consultas-financeiras';
import { categoriasDespesa } from './categorias.ts';
import type { Despesa, Receita } from './financeiro';
import { formatarMoeda } from '../utilitarios/formatacao.ts';

export type RemetenteMensagem = 'usuario' | 'assistente';

export type MensagemChat = {
  id: string;
  remetente: RemetenteMensagem;
  texto: string;
  horario: string;
};

export type ContextoDadosAssistente = {
  resumo: ResumoFinanceiro;
  resumoDividas: ResumoDividas;
  gastosPorCategoria: GastoPorCategoria[];
  receitas: Receita[];
  despesas: Despesa[];
  nomeUsuario: string;
};

export const SUGESTOES_PERGUNTAS = [
  'Qual é o meu saldo disponível?',
  'Quanto recebi de receitas?',
  'Qual foi a minha maior despesa?',
  'Como estão as minhas dívidas?',
  'Qual é a previsão para o fim do mês?',
] as const;

export function obterMensagemInicial(nomeUsuario = 'usuário'): MensagemChat {
  return {
    id: 'msg-inicial',
    remetente: 'assistente',
    texto: `Olá, ${nomeUsuario || 'usuário'}! Sou seu Assistente Financeiro demonstrativo. Posso analisar suas receitas, despesas pagas, dívidas e saldo em tempo real com base nos dados locais do aplicativo. Como posso ajudar?`,
    horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Processa a pergunta do usuário e devolve uma resposta inteligente calculada
 * exclusivamente a partir dos dados financeiros locais, sem recorrer a APIs externas.
 */
export function responderPerguntaFinanceira(
  pergunta: string,
  contexto: ContextoDadosAssistente,
): string {
  const p = pergunta.trim().toLowerCase();

  // 1. Perguntas sobre Saldo Disponível
  if (
    p.includes('saldo') ||
    p.includes('saldo disponível') ||
    p.includes('dinheiro') ||
    p.includes('quanto tenho') ||
    p.includes('em conta')
  ) {
    const saldo = formatarMoeda(contexto.resumo.saldoDisponivel);
    const previsao = formatarMoeda(contexto.resumo.saldoPrevisto);
    const situacao = contexto.resumo.saldoDisponivel >= 0 ? 'positivo' : 'negativo';

    return `Seu saldo disponível atual é de ${saldo} (${situacao}), calculado pelas receitas recebidas menos as despesas já pagas. Considerando suas despesas pendentes, a previsão para o final do mês é de ${previsao}.`;
  }

  // 2. Perguntas sobre Receitas / Entradas
  if (
    p.includes('receita') ||
    p.includes('recebi') ||
    p.includes('renda') ||
    p.includes('ganhei') ||
    p.includes('entradas') ||
    p.includes('salário')
  ) {
    const totalReceitas = formatarMoeda(contexto.resumo.receitasRecebidas);
    const qtd = contexto.receitas.length;

    if (qtd === 0) {
      return 'Você ainda não possui receitas registradas no sistema.';
    }

    const principal = contexto.receitas[0];
    const infoPrincipal = principal
      ? ` A entrada mais recente foi "${principal.descricao}" no valor de ${formatarMoeda(principal.valorCentavos)}.`
      : '';

    return `Você acumulou ${totalReceitas} em receitas recebidas, distribuídas em ${qtd} lançamento(s).${infoPrincipal}`;
  }

  // 3. Perguntas sobre Maior Despesa ou Gastos
  if (
    p.includes('maior despesa') ||
    p.includes('mais gastei') ||
    p.includes('gasto') ||
    p.includes('maior gasto') ||
    p.includes('despesas')
  ) {
    const despesasPagas = contexto.despesas.filter((d) => d.situacao === 'paga');

    if (despesasPagas.length === 0) {
      return 'Você não possui despesas pagas registradas até o momento.';
    }

    const maiorDespesa = [...despesasPagas].sort(
      (a, b) => b.valorCentavos - a.valorCentavos,
    )[0];

    const maiorCategoria = contexto.gastosPorCategoria[0];
    const nomeCategoria = maiorCategoria
      ? categoriasDespesa[maiorCategoria.categoria] ?? maiorCategoria.categoria
      : '';

    let infoCategoria = '';
    if (maiorCategoria && contexto.resumo.despesasPagas > 0) {
      const perc = Math.round(
        (maiorCategoria.valorCentavos / contexto.resumo.despesasPagas) * 100,
      );
      infoCategoria = ` Por categoria, seu maior custo está em ${nomeCategoria} (${formatarMoeda(maiorCategoria.valorCentavos)}, representando ${perc}% do total pago).`;
    }

    return `Sua maior despesa individual quitada é "${maiorDespesa.descricao}" no valor de ${formatarMoeda(maiorDespesa.valorCentavos)}.${infoCategoria}`;
  }

  // 4. Perguntas sobre Dívidas e Parcelamentos
  if (
    p.includes('dívida') ||
    p.includes('divida') ||
    p.includes('parcela') ||
    p.includes('devo') ||
    p.includes('empréstimo') ||
    p.includes('financiamento')
  ) {
    const { saldoDevedorTotal, totalPago, quantidadeDividas, quantidadeQuitadas } =
      contexto.resumoDividas;

    if (quantidadeDividas === 0) {
      return 'Você não possui nenhuma dívida cadastrada. Suas contas estão livres de parcelamentos no momento!';
    }

    if (saldoDevedorTotal === 0) {
      return `Parabéns! Todas as suas ${quantidadeDividas} dívidas cadastradas estão 100% quitadas. Você já amortizou o total de ${formatarMoeda(totalPago)}.`;
    }

    return `Você possui um saldo devedor total de ${formatarMoeda(saldoDevedorTotal)} restante. Até o momento, já foram pagos ${formatarMoeda(totalPago)}, e ${quantidadeQuitadas} de ${quantidadeDividas} dívidas estão totalmente quitadas.`;
  }

  // 5. Previsão de fim de mês
  if (
    p.includes('previsão') ||
    p.includes('previsao') ||
    p.includes('fim do mês') ||
    p.includes('fim de mês') ||
    p.includes('restante do mês')
  ) {
    const saldoPrevisto = formatarMoeda(contexto.resumo.saldoPrevisto);
    const pendentes = formatarMoeda(contexto.resumo.despesasPendentes);

    return `A previsão para o final do mês é de um saldo de ${saldoPrevisto}. Há ainda ${pendentes} em despesas pendentes a serem quitadas.`;
  }

  // 6. Resposta padrão para perguntas não previstas / fora do escopo
  return 'Como assistente demonstrativo local, consigo consultar suas finanças imediatas. Experimente perguntar sobre seu "saldo disponível", "total de receitas", "maior despesa", "situação das dívidas" ou "previsão para o fim do mês".';
}
