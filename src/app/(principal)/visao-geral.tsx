import { useRouter } from 'expo-router';

import { Botao } from '@/componentes/Botao';
import { Cartao } from '@/componentes/Cartao';
import { Marca } from '@/componentes/Marca';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';

export default function VisaoGeral() {
  const navegador = useRouter();
  return (
    <Tela edges={['top', 'right', 'left']}>
      <Marca />
      <Texto variante="titulo" accessibilityRole="header">Visão geral</Texto>
      <Texto tom="secundaria">Seu dinheiro, com mais clareza.</Texto>
      <Cartao>
        <Texto variante="subtitulo">Bem-vindo à demonstração</Texto>
        <Texto tom="secundaria">Seu resumo financeiro estará disponível em breve.</Texto>
      </Cartao>
      <Botao titulo="Novo lançamento" onPress={() => navegador.push('/novo-lancamento')} />
      <Botao titulo="Meu perfil" variante="secundaria" onPress={() => navegador.push('/perfil')} />
    </Tela>
  );
}
