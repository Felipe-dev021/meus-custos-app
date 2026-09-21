import type { CategoriaDespesa, CategoriaReceita } from './financeiro';

export const categoriasReceita = {
  salario: 'Salário',
  'trabalho-extra': 'Trabalho extra',
  'outras-receitas': 'Outras receitas',
} as const satisfies Record<CategoriaReceita, string>;

export const categoriasDespesa = {
  moradia: 'Moradia',
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  saude: 'Saúde',
  educacao: 'Educação',
  lazer: 'Lazer',
  compras: 'Compras',
  servicos: 'Serviços',
  'outras-despesas': 'Outras despesas',
} as const satisfies Record<CategoriaDespesa, string>;
