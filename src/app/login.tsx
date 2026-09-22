import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Botao } from '@/componentes/Botao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Cartao } from '@/componentes/Cartao';
import { Marca } from '@/componentes/Marca';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import { temErrosLogin, validarCredenciaisLogin, type ErrosLogin } from '@/dominio/validacao-login';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { cores, espacamentos, raios } from '@/tema';

export default function TelaLogin() {
  const { executar, salvando } = useFinanceiro();
  const [email, definirEmail] = useState('');
  const [senha, definirSenha] = useState('');
  const [erros, definirErros] = useState<ErrosLogin>({});

  function aoEntrar() {
    const novosErros = validarCredenciaisLogin(email, senha);
    if (temErrosLogin(novosErros)) {
      definirErros(novosErros);
      return;
    }

    definirErros({});
    executar({ tipo: 'entrar-demonstracao' });
  }

  function aoEntrarDemonstracao() {
    definirErros({});
    executar({ tipo: 'entrar-demonstracao' });
  }

  function alterarEmail(valor: string) {
    definirEmail(valor);
    if (erros.email) definirErros((anteriores) => ({ ...anteriores, email: undefined }));
  }

  function alterarSenha(valor: string) {
    definirSenha(valor);
    if (erros.senha) definirErros((anteriores) => ({ ...anteriores, senha: undefined }));
  }

  return (
    <Tela contentContainerStyle={estilos.conteudo}>
      <Marca />

      <View style={estilos.cabecalho}>
        <Texto variante="titulo" accessibilityRole="header">
          Acesse sua conta
        </Texto>
        <Texto tom="secundaria">
          Gerencie suas finanças com simplicidade e clareza.
        </Texto>
      </View>

      <Cartao>
        <Texto variante="subtitulo" accessibilityRole="header">
          Entrar
        </Texto>

        <CampoTexto
          rotulo="E-mail"
          placeholder="seu.email@exemplo.com"
          value={email}
          onChangeText={alterarEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          erro={erros.email}
        />

        <CampoTexto
          rotulo="Senha"
          placeholder="••••••••"
          value={senha}
          onChangeText={alterarSenha}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="password"
          erro={erros.senha}
        />

        <Botao
          titulo="Entrar"
          disabled={salvando}
          onPress={aoEntrar}
          style={estilos.espacoBotao}
        />
      </Cartao>

      <View style={estilos.divisor}>
        <View style={estilos.linhaDivisor} />
        <Texto variante="legenda" tom="secundaria" style={estilos.textoDivisor}>
          OU
        </Texto>
        <View style={estilos.linhaDivisor} />
      </View>

      <Cartao style={estilos.cartaoDemonstracao}>
        <View style={estilos.selo}>
          <Texto variante="legenda" tom="primaria">
            ACESSO RÁPIDO
          </Texto>
        </View>
        <Texto variante="subtitulo" accessibilityRole="header">
          Modo de demonstração
        </Texto>
        <Texto tom="secundaria">
          Explore todas as telas, lançamentos e cálculos com dados locais fictícios, sem necessidade de cadastro ou credenciais reais.
        </Texto>
        <Botao
          titulo="Entrar na demonstração"
          variante="secundaria"
          disabled={salvando}
          onPress={aoEntrarDemonstracao}
        />
      </Cartao>

      <Texto variante="legenda" tom="secundaria" style={estilos.rodape}>
        Meus Custos · Controle financeiro pessoal
      </Texto>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  conteudo: {
    paddingTop: espacamentos.amplo,
    paddingBottom: espacamentos.amplo,
    gap: espacamentos.extraGrande,
  },
  cabecalho: {
    gap: espacamentos.pequeno,
  },
  espacoBotao: {
    marginTop: espacamentos.pequeno,
  },
  divisor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.medio,
    marginVertical: espacamentos.minimo,
  },
  linhaDivisor: {
    flex: 1,
    height: 1,
    backgroundColor: cores.borda,
  },
  textoDivisor: {
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  cartaoDemonstracao: {
    borderStyle: 'dashed',
    borderColor: cores.borda,
  },
  selo: {
    alignSelf: 'flex-start',
    paddingHorizontal: espacamentos.medio,
    paddingVertical: espacamentos.minimo,
    borderRadius: raios.capsula,
    backgroundColor: cores.primariaSuave,
  },
  rodape: {
    marginTop: 'auto',
    paddingTop: espacamentos.grande,
    textAlign: 'center',
  },
});
