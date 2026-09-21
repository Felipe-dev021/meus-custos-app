export const cores = {
  fundo: '#000000',
  superficie: '#0e0e0f',
  superficieElevada: '#161617',
  borda: '#27272a',
  texto: '#fafafa',
  textoSecundario: '#a1a1aa',
  primaria: '#00ff55',
  primariaPressionada: '#05df72',
  primariaSuave: 'rgba(0, 255, 85, 0.09)',
  sobrePrimaria: '#001a09',
  perigo: '#ff5d62',
  aviso: '#f99c00',
  informacao: '#3080ff',
} as const;

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
