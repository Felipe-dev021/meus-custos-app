import { Text, type TextProps } from 'react-native';

import { tipografia } from '@/tema';
import { useTema } from '@/tema/ContextoTema';

type PropriedadesTexto = TextProps & {
  variante?: keyof typeof tipografia;
  tom?: 'padrao' | 'secundaria' | 'primaria' | 'perigo';
};

export function Texto({
  variante = 'corpo',
  tom = 'padrao',
  style,
  ...propriedades
}: PropriedadesTexto) {
  const { cores } = useTema();

  const tons = {
    padrao: cores.texto,
    secundaria: cores.textoSecundario,
    primaria: cores.primaria,
    perigo: cores.perigo,
  };

  return (
    <Text
      {...propriedades}
      style={[tipografia[variante], { color: tons[tom] }, style]}
    />
  );
}
