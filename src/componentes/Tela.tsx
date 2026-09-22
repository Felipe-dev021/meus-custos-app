import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { cores, espacamentos } from '@/tema';

type PropriedadesTela = PropsWithChildren<{
  rolagem?: boolean;
  edges?: Edge[];
  contentContainerStyle?: StyleProp<ViewStyle>;
}>;

export function Tela({
  children,
  rolagem = true,
  edges = ['top', 'right', 'bottom', 'left'],
  contentContainerStyle,
}: PropriedadesTela) {
  return (
    <SafeAreaView style={estilos.tela} edges={edges}>
      <KeyboardAvoidingView
        style={estilos.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {rolagem ? (
          <ScrollView
            contentContainerStyle={[estilos.conteudo, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            {children}
          </ScrollView>
        ) : (
          <View style={[estilos.conteudo, estilos.flex, contentContainerStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  flex: { flex: 1 },
  conteudo: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    padding: espacamentos.extraGrande,
    gap: espacamentos.extraGrande,
  },
});
