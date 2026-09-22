import { useId, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Texto } from '@/componentes/Texto';
import { cores, raios, espacamentos, tipografia } from '@/tema';

type PropriedadesCampoTexto = TextInputProps & {
  rotulo: string;
  erro?: string;
  dica?: string;
};

export function CampoTexto({
  rotulo,
  erro,
  dica,
  style,
  onFocus,
  onBlur,
  editable = true,
  ...propriedades
}: PropriedadesCampoTexto) {
  const rotuloId = useId();
  const [focado, definirFocado] = useState(false);

  return (
    <View style={estilos.campo}>
      <Texto nativeID={rotuloId} variante="rotulo">{rotulo}</Texto>
      <TextInput
        placeholderTextColor={cores.textoSecundario}
        selectionColor={cores.primaria}
        keyboardAppearance="dark"
        {...propriedades}
        editable={editable}
        accessibilityLabel={propriedades.accessibilityLabel ?? rotulo}
        accessibilityLabelledBy={rotuloId}
        accessibilityHint={erro ?? dica ?? propriedades.accessibilityHint}
        onFocus={(evento) => {
          definirFocado(true);
          onFocus?.(evento);
        }}
        onBlur={(evento) => {
          definirFocado(false);
          onBlur?.(evento);
        }}
        style={[
          estilos.entrada,
          focado && estilos.focado,
          !!erro && estilos.invalido,
          !editable && estilos.desabilitado,
          style,
        ]}
      />
      {(erro || dica) && (
        <Texto
          variante="legenda"
          tom={erro ? 'perigo' : 'secundaria'}
          accessibilityLiveRegion={erro ? 'polite' : 'none'}>
          {erro || dica}
        </Texto>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { gap: espacamentos.pequeno },
  entrada: {
    ...tipografia.corpo,
    minHeight: 52,
    paddingHorizontal: espacamentos.grande,
    paddingVertical: espacamentos.medio,
    borderRadius: raios.pequeno,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficieElevada,
    color: cores.texto,
  },
  focado: { borderColor: cores.primaria },
  invalido: { borderColor: cores.perigo },
  desabilitado: { opacity: 0.5 },
});
