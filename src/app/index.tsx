import { Redirect } from 'expo-router';

import { useFinanceiro } from '@/estado/ContextoFinanceiro';

export default function Entrada() {
  const { demonstracaoAtiva } = useFinanceiro();
  return <Redirect href={demonstracaoAtiva ? '/(principal)/visao-geral' : '/login'} />;
}
