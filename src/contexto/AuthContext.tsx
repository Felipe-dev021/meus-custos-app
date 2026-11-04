import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
}

export interface ContextoAutenticacao {
  usuario: Usuario | null;
  user: Usuario | null;
  estaAutenticado: boolean;
  isAuthenticated: boolean;
  carregando: boolean;
  isLoading: boolean;
  login: (email?: string, senha?: string) => Promise<void>;
  signIn: (email?: string, senha?: string) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const CHAVE_AUTENTICACAO = '@meus_custos:sessao_usuario';

export const AuthContext = createContext<ContextoAutenticacao | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [usuario, definirUsuario] = useState<Usuario | null>(null);
  const [carregando, definirCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregarSessao() {
      try {
        const armazenado = await AsyncStorage.getItem(CHAVE_AUTENTICACAO);
        if (armazenado && ativo) {
          const dadosConvertidos = JSON.parse(armazenado) as Usuario;
          definirUsuario(dadosConvertidos);
        }
      } catch {
        // Falha silenciosa na leitura da sessão inicial
      } finally {
        if (ativo) {
          definirCarregando(false);
        }
      }
    }

    void carregarSessao();

    return () => {
      ativo = false;
    };
  }, []);

  async function login(email?: string, _senha?: string) {
    const emailLimpo = email?.trim() || 'demo@exemplo.com';
    const parteNome = emailLimpo.split('@')[0] || 'Usuário';
    const nomeFormatado = parteNome.charAt(0).toUpperCase() + parteNome.slice(1);

    const novoUsuario: Usuario = {
      id: 'usuario-' + Date.now(),
      nome: nomeFormatado,
      email: emailLimpo,
    };

    definirUsuario(novoUsuario);
    await AsyncStorage.setItem(CHAVE_AUTENTICACAO, JSON.stringify(novoUsuario));
  }

  async function logout() {
    definirUsuario(null);
    await AsyncStorage.removeItem(CHAVE_AUTENTICACAO);
  }

  const estaAutenticado = Boolean(usuario);

  const valor: ContextoAutenticacao = {
    usuario,
    user: usuario,
    estaAutenticado,
    isAuthenticated: estaAutenticado,
    carregando,
    isLoading: carregando,
    login,
    signIn: login,
    logout,
    signOut: logout,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): ContextoAutenticacao {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.');
  }
  return contexto;
}

// Aliases para máxima compatibilidade com padrões da documentação
export const useSession = useAuth;
export const SessionProvider = AuthProvider;
