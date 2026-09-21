import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { Texto } from '@/componentes/Texto';
import { cores, raios, espacamentos } from '@/tema';

type PropriedadesBotao = Omit<PressableProps, 'children'> & {
  titulo: string;
  variante?: 'primaria' | 'secundaria';
  carregando?: boolean;
};

export function Botao({
  titulo,
  variante = 'primaria',
  carregando = false,
  disabled = false,
  style,
  accessibilityState,
  ...propriedades
}: PropriedadesBotao) {
  const indisponivel = disabled || carregando;
  const corTexto = variante === 'primaria' ? cores.sobrePrimaria : cores.texto;

  return (
    <Pressable
      {...propriedades}
      accessibilityRole="button"
      accessibilityLabel={propriedades.accessibilityLabel ?? titulo}
      accessibilityState={{ ...accessibilityState, disabled: indisponivel, busy: carregando }}
      disabled={indisponivel}
      style={(estado) => [
        estilos.botao,
        estilos[variante],
        estado.pressed && (variante === 'primaria' ? estilos.primariaPressionada : estilos.secundariaPressionada),
        indisponivel && estilos.desabilitado,
        typeof style === 'function' ? style(estado) : style,
      ]}>
      {carregando && <ActivityIndicator color={corTexto} />}
      <Texto variante="rotulo" style={[estilos.rotulo, { color: corTexto }]}>
        {titulo}
      </Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    minHeight: 50,
    paddingHorizontal: espacamentos.grande,
    paddingVertical: espacamentos.medio,
    borderRadius: raios.pequeno,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamentos.pequeno,
  },
  primaria: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  secundaria: { backgroundColor: cores.superficie, borderColor: cores.borda },
  primariaPressionada: { backgroundColor: cores.primariaPressionada },
  secundariaPressionada: { backgroundColor: cores.superficieElevada },
  desabilitado: { opacity: 0.5 },
  rotulo: { textAlign: 'center', flexShrink: 1 },
});
