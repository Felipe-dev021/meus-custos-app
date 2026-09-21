import { Text, type TextProps } from 'react-native';

import { cores, tipografia } from '@/tema';

type PropriedadesTexto = TextProps & {
  variante?: keyof typeof tipografia;
  tom?: 'padrao' | 'secundaria' | 'primaria' | 'perigo';
};

const tons = {
  padrao: cores.texto,
  secundaria: cores.textoSecundario,
  primaria: cores.primaria,
  perigo: cores.perigo,
};

export function Texto({
  variante = 'corpo',
  tom = 'padrao',
  style,
  ...propriedades
}: PropriedadesTexto) {
  return <Text {...propriedades} style={[tipografia[variante], { color: tons[tom] }, style]} />;
}
