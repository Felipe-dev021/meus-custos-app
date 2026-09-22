import { useRouter } from 'expo-router';

import { Botao } from '@/componentes/Botao';
import { Cartao } from '@/componentes/Cartao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';

type PropriedadesTelaEmBreve = { titulo: string; emAba?: boolean };

/** Rota mínima para as áreas cuja implementação ainda não está disponível. */
export function TelaEmBreve({ titulo, emAba = false }: PropriedadesTelaEmBreve) {
  const navegador = useRouter();
  return (
    <Tela edges={emAba ? ['top', 'right', 'left'] : ['top', 'right', 'bottom', 'left']}>
      {!emAba && <Botao titulo="Voltar" variante="secundaria" onPress={() => {
        if (navegador.canGoBack()) navegador.back();
        else navegador.replace('/(principal)/visao-geral');
      }} />}
      <Texto variante="titulo" accessibilityRole="header">{titulo}</Texto>
      <Cartao>
        <Texto variante="subtitulo">Em breve</Texto>
        <Texto tom="secundaria">Esta área ainda não está disponível na demonstração.</Texto>
      </Cartao>
    </Tela>
  );
}
