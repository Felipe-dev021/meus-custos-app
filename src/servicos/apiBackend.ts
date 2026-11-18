import { URL_API_PADRAO } from '../dominio/sincronizacao.ts';

export const URL_BASE_API =
  typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL
    : URL_API_PADRAO;

const TIMEOUT_PADRAO_MS = 4000;

async function fetchComTimeout(url: string, options: RequestInit = {}, timeoutMs = TIMEOUT_PADRAO_MS): Promise<Response> {
  const controller = new AbortController();
  const idTimeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resposta = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers ?? {}),
      },
    });
    return resposta;
  } finally {
    clearTimeout(idTimeout);
  }
}

export interface RespostaAuthBackend {
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
  mensagem: string;
}

export async function testarConectividadeBackend(urlBase = URL_BASE_API): Promise<boolean> {
  try {
    const res = await fetchComTimeout(`${urlBase}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: '__ping__@teste.com' }),
    }, 2000);
    return res.status < 500;
  } catch {
    return false;
  }
}

export async function apiLogin(email: string, senha?: string, urlBase = URL_BASE_API): Promise<RespostaAuthBackend> {
  const res = await fetchComTimeout(`${urlBase}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });

  if (!res.ok) {
    const erro = await res.json().catch(() => ({ message: 'Falha na autenticação' }));
    throw new Error(erro.message || `Erro ${res.status} ao autenticar.`);
  }

  return res.json();
}

export async function apiRegistro(nome: string, email: string, senha?: string, urlBase = URL_BASE_API): Promise<RespostaAuthBackend> {
  const res = await fetchComTimeout(`${urlBase}/api/auth/registro`, {
    method: 'POST',
    body: JSON.stringify({ nome, email, senha }),
  });

  if (!res.ok) {
    const erro = await res.json().catch(() => ({ message: 'Falha no cadastro' }));
    throw new Error(erro.message || `Erro ${res.status} ao cadastrar.`);
  }

  return res.json();
}

export async function apiEnviarSincronizacao(payload: unknown, urlBase = URL_BASE_API): Promise<any> {
  const res = await fetchComTimeout(`${urlBase}/api/sincronizacao`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const erro = await res.json().catch(() => ({ message: 'Falha na sincronização' }));
    throw new Error(erro.message || `Erro ${res.status} ao sincronizar com nuvem.`);
  }

  return res.json();
}

export async function apiBaixarSincronizacao(usuarioId: string, urlBase = URL_BASE_API): Promise<any> {
  const res = await fetchComTimeout(`${urlBase}/api/sincronizacao/${usuarioId}`, {
    method: 'GET',
  });

  if (!res.ok) {
    const erro = await res.json().catch(() => ({ message: 'Falha ao buscar dados remotos' }));
    throw new Error(erro.message || `Erro ${res.status} ao baixar dados do servidor.`);
  }

  return res.json();
}
