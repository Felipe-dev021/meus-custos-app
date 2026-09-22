import { useId, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Texto } from '@/componentes/Texto';
import { espacamentos, raios, tipografia } from '@/tema';
import { useTema } from '@/tema/ContextoTema';

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
  const { cores, tema } = useTema();
  const rotuloId = useId();
  const [focado, definirFocado] = useState(false);

  return (
    <View style={estilos.campo}>
      <Texto nativeID={rotuloId} variante="rotulo">
        {rotulo}
      </Texto>
      <TextInput
        placeholderTextColor={cores.textoSecundario}
        selectionColor={cores.primaria}
        keyboardAppearance={tema === 'escuro' ? 'dark' : 'light'}
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
          {
            backgroundColor: cores.superficieElevada,
            borderColor: cores.borda,
            color: cores.texto,
          },
          focado && { borderColor: cores.primaria },
          !!erro && { borderColor: cores.perigo },
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
  },
  desabilitado: { opacity: 0.5 },
});
