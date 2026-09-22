import { useRouter } from 'expo-router';

import { Botao } from '@/componentes/Botao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';

export default function Mais() {
  const navegador = useRouter();
  const { executar, salvando } = useFinanceiro();
  return (
    <Tela edges={['top', 'right', 'left']}>
      <Texto variante="titulo" accessibilityRole="header">Mais opções</Texto>
      <Texto tom="secundaria">Explore as áreas do Meus Custos.</Texto>
      <Botao titulo="Dívidas" variante="secundaria" onPress={() => navegador.push('/dividas')} />
      <Botao titulo="Assistente" variante="secundaria" onPress={() => navegador.push('/assistente')} />
      <Botao titulo="Perfil" variante="secundaria" onPress={() => navegador.push('/perfil')} />
      <Botao titulo="Sair da demonstração" disabled={salvando} onPress={() => executar({ tipo: 'sair-demonstracao' })} />
      <Texto variante="legenda" tom="secundaria">Seus dados de demonstração continuam salvos neste aparelho.</Texto>
    </Tela>
  );
}
