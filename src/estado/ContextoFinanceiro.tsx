import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type PropsWithChildren } from 'react';

import { Botao } from '@/componentes/Botao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import { useAuth } from '@/contexto/AuthContext';
import { criarDadosDemonstracao, criarDadosVazios } from '@/dados/demonstracao';
import { obterChaveDadosUsuario } from '@/dados/persistencia';

import {
  calcularGastosPorCategoria,
  calcularResumoDividas,
  calcularResumoFinanceiro,
  listarDespesas,
  listarReceitas,
  listarUltimosLancamentos,
} from '@/dominio/consultas-financeiras';
import { criarEstadoFinanceiro } from '@/estado/estado-financeiro';

const ContextoFinanceiro = createContext<ReturnType<typeof criarEstadoFinanceiro> | null>(null);

export function ProvedorFinanceiro({ children }: PropsWithChildren) {
  const { usuario } = useAuth();
  const usuarioId = usuario?.id ?? null;
  const ehDemo = !usuario || usuario.email === 'demo@exemplo.com' || usuario.id === 'usuario-demo';

  const central = useMemo(() => {
    const chave = obterChaveDadosUsuario(usuarioId);
    const dadosIniciais = ehDemo
      ? criarDadosDemonstracao()
      : criarDadosVazios({ nome: usuario?.nome, email: usuario?.email });

    return criarEstadoFinanceiro(dadosIniciais, {
      ler: () => AsyncStorage.getItem(chave),
      gravar: (conteudo) => AsyncStorage.setItem(chave, conteudo),
    });
  }, [usuarioId, ehDemo, usuario?.nome, usuario?.email]);

  const estado = useSyncExternalStore(central.assinar, central.obterEstado, central.obterEstado);

  useEffect(() => {
    async function inicializar() {
      await central.iniciar();
      if (usuarioId || ehDemo) {
        central.executar({ tipo: 'entrar-demonstracao' });
      }
    }
    void inicializar();
  }, [central, usuarioId, ehDemo]);

  if (!estado.carregado || estado.erroArmazenamento) {
    return (
      <Tela>
        <Texto variante="subtitulo">
          {estado.erroArmazenamento ? 'Precisamos tentar novamente' : 'Carregando suas finanças…'}
        </Texto>
        {estado.erroArmazenamento && (
          <>
            <Texto tom="secundaria" accessibilityLiveRegion="polite">
              {estado.erroArmazenamento}
            </Texto>
            <Botao titulo="Tentar novamente" onPress={() => { void central.tentarNovamente(); }} />
          </>
        )}
      </Tela>
    );
  }
  return <ContextoFinanceiro.Provider value={central}>{children}</ContextoFinanceiro.Provider>;
}

export function useFinanceiro() {
  const central = useContext(ContextoFinanceiro);
  if (!central) throw new Error('useFinanceiro deve ser usado dentro do ProvedorFinanceiro.');
  const estado = useSyncExternalStore(central.assinar, central.obterEstado, central.obterEstado);
  const consultas = useMemo(() => ({
    resumo: calcularResumoFinanceiro(estado.dados.lancamentos),
    resumoDividas: calcularResumoDividas(estado.dados.dividas),
    receitas: listarReceitas(estado.dados.lancamentos),
    despesas: listarDespesas(estado.dados.lancamentos),
    gastosPorCategoria: calcularGastosPorCategoria(estado.dados.lancamentos),
    ultimosLancamentos: listarUltimosLancamentos(estado.dados.lancamentos),
  }), [estado.dados.lancamentos, estado.dados.dividas]);

  return { ...estado, ...consultas, executar: central.executar };
}
