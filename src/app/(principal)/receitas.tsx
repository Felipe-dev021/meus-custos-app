import { useRouter } from 'expo-router';

import { Botao } from '@/componentes/Botao';
import { Cartao } from '@/componentes/Cartao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';

export default function Receitas() {
  const navegador = useRouter();
  return (
    <Tela edges={['top', 'right', 'left']}>
      <Texto variante="titulo" accessibilityRole="header">Receitas</Texto>
      <Texto tom="secundaria">Acompanhe suas entradas.</Texto>
      <Cartao><Texto tom="secundaria">Sua lista de receitas estará disponível em breve.</Texto></Cartao>
      <Botao titulo="Adicionar receita" onPress={() => navegador.push({ pathname: '/novo-lancamento', params: { tipo: 'receita' } })} />
    </Tela>
  );
}
