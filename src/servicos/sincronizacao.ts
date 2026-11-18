import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHAVE_DADOS } from '../dados/persistencia.ts';
import type { DadosFinanceiros } from '../dominio/financeiro.ts';
import { CHAVE_STORAGE_ORCAMENTOS } from '../dominio/orcamentos.ts';
import {
  CHAVE_ULTIMA_SINCRONIZACAO,
  montarPayloadSincronizacao,
  validarRespostaSincronizacao,
  type RespostaSincronizacaoNuvem,
} from '../dominio/sincronizacao.ts';
import { apiBaixarSincronizacao, apiEnviarSincronizacao } from './apiBackend.ts';

export { CHAVE_ULTIMA_SINCRONIZACAO };

export interface StatusSincronizacao {
  online: boolean;
  sincronizadoEm: string | null;
  mensagem: string;
  totais?: RespostaSincronizacaoNuvem['totais'];
}

export async function obterHistoricoUltimaSincronizacao(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(CHAVE_ULTIMA_SINCRONIZACAO);
  } catch {
    return null;
  }
}

export async function sincronizarComNuvem(usuarioId: string): Promise<StatusSincronizacao> {
  if (!usuarioId) {
    return {
      online: false,
      sincronizadoEm: null,
      mensagem: 'Usuário não autenticado para sincronização.',
    };
  }

  try {
    const dadosArmazenadosRaw = await AsyncStorage.getItem(CHAVE_DADOS);
    const dadosFinanceiros: DadosFinanceiros | null = dadosArmazenadosRaw ? JSON.parse(dadosArmazenadosRaw) : null;

    const orcamentosRaw = await AsyncStorage.getItem(CHAVE_STORAGE_ORCAMENTOS);
    const limitesSalvos = orcamentosRaw ? JSON.parse(orcamentosRaw) : {};

    const payload = montarPayloadSincronizacao(usuarioId, dadosFinanceiros, limitesSalvos);
    const res = await apiEnviarSincronizacao(payload);
    const respostaValidada = validarRespostaSincronizacao(res);

    await AsyncStorage.setItem(CHAVE_ULTIMA_SINCRONIZACAO, respostaValidada.sincronizadoEm);

    return {
      online: true,
      sincronizadoEm: respostaValidada.sincronizadoEm,
      mensagem: 'Dados sincronizados com o PostgreSQL com sucesso.',
      totais: respostaValidada.totais,
    };
  } catch (erro: any) {
    const ultimoSucesso = await obterHistoricoUltimaSincronizacao();
    return {
      online: false,
      sincronizadoEm: ultimoSucesso,
      mensagem: erro?.message ? `Modo offline: ${erro.message}` : 'Servidor backend offline. Dados mantidos localmente.',
    };
  }
}

export async function restaurarDadosDaNuvem(usuarioId: string): Promise<boolean> {
  try {
    const dadosRemotos = await apiBaixarSincronizacao(usuarioId);
    if (!dadosRemotos) return false;

    const dadosLocais: DadosFinanceiros = {
      perfil: {
        nome: dadosRemotos.usuario.nome,
        email: dadosRemotos.usuario.email,
      },
      lancamentos: dadosRemotos.lancamentos || [],
      dividas: dadosRemotos.dividas || [],
    };

    await AsyncStorage.setItem(CHAVE_DADOS, JSON.stringify(dadosLocais));

    if (dadosRemotos.orcamentos && Array.isArray(dadosRemotos.orcamentos)) {
      const mapaOrcamentos: Record<string, number> = {};
      dadosRemotos.orcamentos.forEach((item: any) => {
        mapaOrcamentos[item.categoria] = item.limiteCentavos;
      });
      await AsyncStorage.setItem(CHAVE_STORAGE_ORCAMENTOS, JSON.stringify(mapaOrcamentos));
    }

    await AsyncStorage.setItem(CHAVE_ULTIMA_SINCRONIZACAO, new Date().toISOString());
    return true;
  } catch {
    return false;
  }
}
