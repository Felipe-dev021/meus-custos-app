export const CHAVE_TEMA = '@meus-custos/tema';

export type ModoTema = 'escuro' | 'claro';

export const coresEscuro = {
  fundo: '#000000',
  superficie: '#0e0e0f',
  superficieElevada: '#161617',
  borda: '#27272a',
  bordaSuave: '#1f1f23',
  texto: '#fafafa',
  textoSecundario: '#a1a1aa',
  textoMutado: '#71717a',
  primaria: '#00ff55',
  primariaPressionada: '#05df72',
  primariaSuave: 'rgba(0, 255, 85, 0.09)',
  sobrePrimaria: '#001a09',
  perigo: '#ff5d62',
  aviso: '#f99c00',
  informacao: '#3080ff',
  sucesso: '#00ff55',
  painelDrawer: '#0c0c0e',
  cartaoMetrica: '#121214',
  iconeCaixa: '#1c1c1f',
  itemLinkAtivo: '#1c1c1f',
  tagPill: '#1c1c1f',
  fundoModal: 'rgba(0, 0, 0, 0.75)',
};

export const coresClaro = {
  fundo: '#f4f4f5',
  superficie: '#ffffff',
  superficieElevada: '#ffffff',
  borda: '#e4e4e7',
  bordaSuave: '#f1f1f4',
  texto: '#09090b',
  textoSecundario: '#52525b',
  textoMutado: '#71717a',
  primaria: '#00873a',
  primariaPressionada: '#007030',
  primariaSuave: 'rgba(0, 135, 58, 0.12)',
  sobrePrimaria: '#ffffff',
  perigo: '#dc2626',
  aviso: '#b45309',
  informacao: '#1d4ed8',
  sucesso: '#15803d',
  painelDrawer: '#ffffff',
  cartaoMetrica: '#ffffff',
  iconeCaixa: '#f4f4f5',
  itemLinkAtivo: '#e4e4e7',
  tagPill: '#f4f4f5',
  fundoModal: 'rgba(0, 0, 0, 0.5)',
};

export type CoresTema = typeof coresEscuro;

/** Paleta padrão inicial para retrocompatibilidade e tipagem estática */
export const cores = coresEscuro;

export const espacamentos = {
  minimo: 4,
  pequeno: 8,
  medio: 12,
  grande: 16,
  extraGrande: 24,
  amplo: 32,
  muitoAmplo: 48,
} as const;

export const raios = { pequeno: 10, medio: 16, capsula: 999 } as const;

export const tipografia = {
  titulo: { fontSize: 30, lineHeight: 38, fontWeight: '700' },
  subtitulo: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  corpo: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  rotulo: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  legenda: { fontSize: 13, lineHeight: 20, fontWeight: '400' },
  valor: { fontSize: 32, lineHeight: 40, fontWeight: '700' },
} as const;
