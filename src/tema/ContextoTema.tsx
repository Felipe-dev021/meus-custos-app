import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  coresClaro,
  coresEscuro,
  type CoresTema,
  type ModoTema,
} from './index';

export const CHAVE_TEMA = '@meus-custos/tema';

export type ContextoTemaTipo = {
  tema: ModoTema;
  cores: CoresTema;
  carregado: boolean;
  alternarTema: () => void;
  definirTema: (novoTema: ModoTema) => void;
};

const ContextoTema = createContext<ContextoTemaTipo>({
  tema: 'escuro',
  cores: coresEscuro,
  carregado: false,
  alternarTema: () => {},
  definirTema: () => {},
});

export function ProvedorTema({ children }: PropsWithChildren) {
  const [tema, setTema] = useState<ModoTema>('escuro');
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarTemaSalvo() {
      try {
        const salvo = await AsyncStorage.getItem(CHAVE_TEMA);
        if (ativo && (salvo === 'claro' || salvo === 'escuro')) {
          setTema(salvo);
        }
      } catch {
        // Na ausência de preferência salva ou falha de leitura, usa tema escuro.
      } finally {
        if (ativo) {
          setCarregado(true);
        }
      }
    }

    void carregarTemaSalvo();

    return () => {
      ativo = false;
    };
  }, []);

  const definirTema = useCallback((novoTema: ModoTema) => {
    setTema(novoTema);
    void AsyncStorage.setItem(CHAVE_TEMA, novoTema).catch(() => {});
  }, []);

  const alternarTema = useCallback(() => {
    setTema((temaAtual) => {
      const proximo: ModoTema = temaAtual === 'escuro' ? 'claro' : 'escuro';
      void AsyncStorage.setItem(CHAVE_TEMA, proximo).catch(() => {});
      return proximo;
    });
  }, []);

  const cores = useMemo<CoresTema>(
    () => (tema === 'escuro' ? coresEscuro : coresClaro),
    [tema],
  );

  const valor = useMemo<ContextoTemaTipo>(
    () => ({
      tema,
      cores,
      carregado,
      alternarTema,
      definirTema,
    }),
    [tema, cores, carregado, alternarTema, definirTema],
  );

  return (
    <ContextoTema.Provider value={valor}>{children}</ContextoTema.Provider>
  );
}

export function useTema(): ContextoTemaTipo {
  return useContext(ContextoTema);
}
