import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Botao } from '@/componentes/Botao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Cartao } from '@/componentes/Cartao';
import { Marca } from '@/componentes/Marca';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import { useAuth } from '@/contexto/AuthContext';
import {
  temErrosRegistro,
  validarCamposRegistro,
  type ErrosRegistro,
} from '@/dominio/validacao-registro';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { espacamentos } from '@/tema';

export default function TelaRegistro() {
  const { cadastrar, estaAutenticado } = useAuth();
  const { executar, salvando } = useFinanceiro();

  const [nome, definirNome] = useState('');
  const [email, definirEmail] = useState('');
  const [senha, definirSenha] = useState('');
  const [confirmacaoSenha, definirConfirmacaoSenha] = useState('');
  const [erros, definirErros] = useState<ErrosRegistro>({});

  useEffect(() => {
    if (estaAutenticado) {
      router.replace('/');
    }
  }, [estaAutenticado]);

  async function aoCadastrar() {
    const novosErros = validarCamposRegistro(nome, email, senha, confirmacaoSenha);
    if (temErrosRegistro(novosErros)) {
      definirErros(novosErros);
      return;
    }

    definirErros({});
    executar({ tipo: 'entrar-demonstracao' });
    executar({
      tipo: 'atualizar-perfil',
      perfil: {
        nome: nome.trim(),
        email: email.trim(),
      },
    });

    await cadastrar(nome, email, senha);
    router.replace('/');
  }

  function alterarNome(valor: string) {
    definirNome(valor);
    if (erros.nome) definirErros((ant) => ({ ...ant, nome: undefined }));
  }

  function alterarEmail(valor: string) {
    definirEmail(valor);
    if (erros.email) definirErros((ant) => ({ ...ant, email: undefined }));
  }

  function alterarSenha(valor: string) {
    definirSenha(valor);
    if (erros.senha) definirErros((ant) => ({ ...ant, senha: undefined }));
  }

  function alterarConfirmacaoSenha(valor: string) {
    definirConfirmacaoSenha(valor);
    if (erros.confirmacaoSenha) {
      definirErros((ant) => ({ ...ant, confirmacaoSenha: undefined }));
    }
  }

  return (
    <Tela contentContainerStyle={estilos.conteudo}>
      <Marca />

      <View style={estilos.cabecalho}>
        <Texto variante="titulo" accessibilityRole="header">
          Crie sua conta
        </Texto>
        <Texto tom="secundaria">
          Comece a organizar suas finanças hoje mesmo.
        </Texto>
      </View>

      <Cartao>
        <Texto variante="subtitulo" accessibilityRole="header">
          Novo cadastro
        </Texto>

        <CampoTexto
          rotulo="Nome completo"
          placeholder="Ex: Carlos Oliveira"
          value={nome}
          onChangeText={alterarNome}
          autoCapitalize="words"
          autoCorrect={false}
          erro={erros.nome}
        />

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
          placeholder="Mínimo 6 caracteres"
          value={senha}
          onChangeText={alterarSenha}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          erro={erros.senha}
        />

        <CampoTexto
          rotulo="Confirmar senha"
          placeholder="Repita sua senha"
          value={confirmacaoSenha}
          onChangeText={alterarConfirmacaoSenha}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          erro={erros.confirmacaoSenha}
        />

        <Botao
          titulo="Cadastrar e entrar"
          disabled={salvando}
          onPress={aoCadastrar}
          style={estilos.espacoBotao}
        />
      </Cartao>

      <View style={estilos.areaLogin}>
        <Texto tom="secundaria">Já tem uma conta cadastrada?</Texto>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar para a tela de login"
          onPress={() => router.replace('/(auth)/login')}>
          <Texto tom="primaria" style={estilos.linkLogin}>
            Entrar no Meus Custos
          </Texto>
        </Pressable>
      </View>

      <Texto variante="legenda" tom="secundaria" style={estilos.rodape}>
        Meus Custos · Controle financeiro pessoal
      </Texto>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  conteudo: {
    paddingTop: espacamentos.grande,
    paddingBottom: espacamentos.amplo,
    gap: espacamentos.grande,
  },
  cabecalho: {
    gap: espacamentos.pequeno,
  },
  espacoBotao: {
    marginTop: espacamentos.pequeno,
  },
  areaLogin: {
    alignItems: 'center',
    gap: espacamentos.minimo,
    paddingVertical: espacamentos.medio,
  },
  linkLogin: {
    fontWeight: '700',
  },
  rodape: {
    marginTop: 'auto',
    paddingTop: espacamentos.grande,
    textAlign: 'center',
  },
});
