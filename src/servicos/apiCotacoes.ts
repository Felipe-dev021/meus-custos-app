import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ItemCotacao {
  codigo: 'USD' | 'EUR' | 'BTC' | string;
  codigoPara: string;
  nome: string;
  valorCompra: number;
  valorVenda: number;
  variacaoPercentual: number;
  maxima: number;
  minima: number;
  atualizacao: string;
}

export interface RespostaCotacoes {
  cotacoes: ItemCotacao[];
  origem: 'online' | 'cache' | 'padrao';
  dataHora: string;
}

export const CHAVE_CACHE_COTACOES = '@meus_custos:cache_cotacoes';

/** Cotações padrão de contingência caso não haja conexão nem cache prévio */
export const COTACOES_CONTINGENCIA: ItemCotacao[] = [
  {
    codigo: 'USD',
    codigoPara: 'BRL',
    nome: 'Dólar Comercial',
    valorCompra: 5.85,
    valorVenda: 5.86,
    variacaoPercentual: 0.25,
    maxima: 5.88,
    minima: 5.82,
    atualizacao: 'Offline / Padrão',
  },
  {
    codigo: 'EUR',
    codigoPara: 'BRL',
    nome: 'Euro',
    valorCompra: 6.20,
    valorVenda: 6.22,
    variacaoPercentual: -0.15,
    maxima: 6.25,
    minima: 6.18,
    atualizacao: 'Offline / Padrão',
  },
  {
    codigo: 'BTC',
    codigoPara: 'BRL',
    nome: 'Bitcoin',
    valorCompra: 545000.0,
    valorVenda: 546000.0,
    variacaoPercentual: 1.85,
    maxima: 550000.0,
    minima: 538000.0,
    atualizacao: 'Offline / Padrão',
  },
];

/** Converte resposta bruta da AwesomeAPI para o formato do Meus Custos */
export function normalizarRespostaAwesomeApi(dadosBrutos: Record<string, any>): ItemCotacao[] {
  const chaves = ['USDBRL', 'EURBRL', 'BTCBRL'];
  const lista: ItemCotacao[] = [];

  for (const chave of chaves) {
    const item = dadosBrutos[chave];
    if (item && item.code && item.bid) {
      lista.push({
        codigo: item.code,
        codigoPara: item.codein || 'BRL',
        nome: item.name ? item.name.split('/')[0] : item.code,
        valorCompra: parseFloat(item.bid) || 0,
        valorVenda: parseFloat(item.ask) || parseFloat(item.bid) || 0,
        variacaoPercentual: parseFloat(item.pctChange) || 0,
        maxima: parseFloat(item.high) || 0,
        minima: parseFloat(item.low) || 0,
        atualizacao: item.create_date || new Date().toLocaleString('pt-BR'),
      });
    }
  }

  return lista.length > 0 ? lista : COTACOES_CONTINGENCIA;
}

/** Calcula conversão de valor em reais para moeda estrangeira */
export function converterReaisParaMoeda(valorCentavosReais: number, valorCompraMoeda: number): number {
  if (!valorCompraMoeda || valorCompraMoeda <= 0) return 0;
  const valorReais = valorCentavosReais / 100;
  return valorReais / valorCompraMoeda;
}

/** Calcula conversão de moeda estrangeira para reais */
export function converterMoedaParaReais(quantidadeMoeda: number, valorCompraMoeda: number): number {
  if (!quantidadeMoeda || !valorCompraMoeda) return 0;
  return quantidadeMoeda * valorCompraMoeda;
}

/** Busca as cotações em tempo real da API pública com timeout e cache local no AsyncStorage */
export async function buscarCotacoesMoedas(): Promise<RespostaCotacoes> {
  const url = 'https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL';

  try {
    const controlador = new AbortController();
    const timeout = setTimeout(() => controlador.abort(), 6000);

    const resposta = await fetch(url, {
      signal: controlador.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeout);

    if (resposta.ok) {
      const json = await resposta.json();
      const cotacoesFormatadas = normalizarRespostaAwesomeApi(json);

      const resultado: RespostaCotacoes = {
        cotacoes: cotacoesFormatadas,
        origem: 'online',
        dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      // Grava no armazenamento local (AsyncStorage)
      void AsyncStorage.setItem(CHAVE_CACHE_COTACOES, JSON.stringify(resultado)).catch(() => {});

      return resultado;
    }
  } catch {
    // Falha de rede: tentar ler do cache local
  }

  try {
    const cacheArmazenado = await AsyncStorage.getItem(CHAVE_CACHE_COTACOES);
    if (cacheArmazenado) {
      const cacheConvertido = JSON.parse(cacheArmazenado) as RespostaCotacoes;
      return {
        ...cacheConvertido,
        origem: 'cache',
      };
    }
  } catch {
    // Falha de leitura de cache
  }

  return {
    cotacoes: COTACOES_CONTINGENCIA,
    origem: 'padrao',
    dataHora: 'Offline',
  };
}
