import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Botao } from '@/componentes/Botao';
import { CabecalhoNavegacao } from '@/componentes/CabecalhoNavegacao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Cartao } from '@/componentes/Cartao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { espacamentos, raios } from '@/tema';
import { useTema } from '@/tema/ContextoTema';

type ErrosFormulario = {
  nome?: string;
  email?: string;
};

export default function TelaPerfil() {
  const navegador = useRouter();
  const { dados, executar, salvando } = useFinanceiro();
  const { cores } = useTema();

  const [nome, definirNome] = useState(dados.perfil.nome);
  const [email, definirEmail] = useState(dados.perfil.email);
  const [erros, definirErros] = useState<ErrosFormulario>({});
  const [mensagemSucesso, definirMensagemSucesso] = useState(false);

  function validar(): boolean {
    const novosErros: ErrosFormulario = {};
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();

    if (!nomeLimpo) {
      novosErros.nome = 'Informe seu nome.';
    } else if (nomeLimpo.length > 80) {
      novosErros.nome = 'O nome deve ter no máximo 80 caracteres.';
    }

    if (!emailLimpo) {
      novosErros.email = 'Informe seu e-mail.';
    } else if (emailLimpo.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      novosErros.email = 'Informe um e-mail válido (ex: seu.nome@exemplo.com).';
    }

    definirErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function salvarPerfil() {
    if (!validar()) return;

    try {
      executar({
        tipo: 'atualizar-perfil',
        perfil: {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
        },
      });
      definirMensagemSucesso(true);
      setTimeout(() => definirMensagemSucesso(false), 3000);
    } catch (err: any) {
      Alert.alert('Erro ao salvar', err?.message ?? 'Não foi possível atualizar o perfil.');
    }
  }

  function confirmarSaida() {
    Alert.alert(
      'Encerrar sessão demonstrativa',
      'Deseja sair da demonstração? Seus dados salvos neste aparelho serão preservados e restaurados quando você acessar novamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair da demonstração',
          style: 'destructive',
          onPress: () => {
            executar({ tipo: 'sair-demonstracao' });
          },
        },
      ],
    );
  }

  const inicialNome = dados.perfil.nome ? dados.perfil.nome.charAt(0).toUpperCase() : 'U';

  return (
    <Tela edges={['top', 'right', 'left']}>
      {/* Topo com Logo e Menu Hambúrguer */}
      <CabecalhoNavegacao rotaAtiva="perfil" />

      {/* Botão de Retorno e Título */}
      <View style={estilos.cabecalhoSecao}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar à tela anterior"
          onPress={() => {
            if (navegador.canGoBack()) {
              navegador.back();
            } else {
              navegador.replace('/(principal)/visao-geral');
            }
          }}
          style={estilos.botaoVoltar}>
          <Ionicons name="arrow-back-outline" size={16} color={cores.primaria} />
          <Texto variante="rotulo" tom="primaria">
            Voltar
          </Texto>
        </Pressable>

        <View style={estilos.textosTitulo}>
          <Texto variante="titulo" accessibilityRole="header">
            Meu Perfil
          </Texto>
          <Texto tom="secundaria">
            Gerencie seus dados e configurações da demonstração
          </Texto>
        </View>
      </View>

      {/* Cartão de Resumo do Usuário */}
      <Cartao
        style={[
          estilos.cartaoResumoPerfil,
          {
            backgroundColor: cores.cartaoMetrica,
            borderColor: cores.borda,
          },
        ]}>
        <View style={[estilos.avatarGrande, { borderColor: cores.primaria, backgroundColor: cores.fundo }]}>
          <Texto variante="titulo" tom="primaria" style={estilos.letraAvatarGrande}>
            {inicialNome}
          </Texto>
        </View>

        <View style={estilos.infoResumoUsuario}>
          <Texto variante="subtitulo" numberOfLines={1}>
            {dados.perfil.nome || 'Usuário'}
          </Texto>
          <Texto variante="corpo" tom="secundaria" numberOfLines={1}>
            {dados.perfil.email || 'usuario@exemplo.com'}
          </Texto>
          <View
            style={[
              estilos.badgeSessao,
              {
                backgroundColor: 'rgba(0, 255, 85, 0.1)',
                borderColor: 'rgba(0, 255, 85, 0.3)',
              },
            ]}>
            <Texto variante="legenda" tom="primaria" style={estilos.textoBadgeSessao}>
              ● Acesso Demonstrativo Ativo
            </Texto>
          </View>
        </View>
      </Cartao>

      {/* Formulário de Edição de Perfil */}
      <Cartao
        style={[
          estilos.cartaoFormulario,
          {
            backgroundColor: cores.cartaoMetrica,
            borderColor: cores.borda,
          },
        ]}>
        <View style={estilos.topoFormulario}>
          <Texto variante="subtitulo" accessibilityRole="header">
            Editar Dados Pessoais
          </Texto>
          <Texto variante="legenda" tom="secundaria">
            Atualize o nome e o e-mail utilizados no aplicativo
          </Texto>
        </View>

        {mensagemSucesso && (
          <View
            style={[
              estilos.caixaSucesso,
              {
                backgroundColor: 'rgba(0, 255, 85, 0.12)',
                borderColor: cores.primaria,
              },
            ]}>
            <View style={estilos.conteudoSucesso}>
              <Ionicons name="checkmark-circle-outline" size={18} color={cores.primaria} />
              <Texto variante="rotulo" tom="primaria">
                Perfil atualizado com sucesso!
              </Texto>
            </View>
          </View>
        )}

        <CampoTexto
          rotulo="Nome completo"
          placeholder="Ex: Marina Oliveira"
          value={nome}
          onChangeText={(texto) => {
            definirNome(texto);
            if (erros.nome) definirErros((e) => ({ ...e, nome: undefined }));
          }}
          erro={erros.nome}
          autoCapitalize="words"
          autoCorrect={false}
        />

        <CampoTexto
          rotulo="E-mail de contato"
          placeholder="Ex: marina@example.com"
          value={email}
          onChangeText={(texto) => {
            definirEmail(texto);
            if (erros.email) definirErros((e) => ({ ...e, email: undefined }));
          }}
          erro={erros.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Botao
          titulo="Salvar alterações"
          variante="primaria"
          carregando={salvando}
          onPress={salvarPerfil}
          style={estilos.botaoSalvar}
        />
      </Cartao>

      {/* Cartão Informativo: Sobre a Demonstração */}
      <Cartao
        style={[
          estilos.cartaoInfo,
          {
            backgroundColor: cores.cartaoMetrica,
            borderColor: cores.borda,
          },
        ]}>
        <Texto variante="subtitulo" accessibilityRole="header">
          Sobre a Demonstração
        </Texto>

        <View style={estilos.listaItensInfo}>
          <View style={estilos.itemInfo}>
            <View style={estilos.cabecalhoItemInfo}>
              <Ionicons name="hardware-chip-outline" size={16} color={cores.primaria} />
              <Texto variante="rotulo" tom="primaria">
                Armazenamento Local
              </Texto>
            </View>
            <Texto variante="legenda" tom="secundaria" style={estilos.textoItemInfo}>
              Seus dados, lançamentos e configurações são salvos exclusivamente na memória deste aparelho.
            </Texto>
          </View>

          <View style={estilos.itemInfo}>
            <View style={estilos.cabecalhoItemInfo}>
              <Ionicons name="shield-checkmark-outline" size={16} color={cores.primaria} />
              <Texto variante="rotulo" tom="primaria">
                Privacidade e Segurança
              </Texto>
            </View>
            <Texto variante="legenda" tom="secundaria" style={estilos.textoItemInfo}>
              Nenhuma credencial ou senha é enviada para a internet ou salva no sistema.
            </Texto>
          </View>

          <View style={estilos.itemInfo}>
            <View style={estilos.cabecalhoItemInfo}>
              <Ionicons name="information-circle-outline" size={16} color={cores.primaria} />
              <Texto variante="rotulo" tom="primaria">
                Versão do Aplicativo
              </Texto>
            </View>
            <Texto variante="legenda" tom="secundaria" style={estilos.textoItemInfo}>
              Meus Custos Mobile · Versão 1.0.0 (Demonstração)
            </Texto>
          </View>
        </View>
      </Cartao>

      {/* Encerramento de Sessão */}
      <Cartao
        style={[
          estilos.cartaoSaida,
          {
            backgroundColor: cores.cartaoMetrica,
            borderColor: cores.borda,
          },
        ]}>
        <View style={estilos.topoSaida}>
          <Texto variante="subtitulo" tom="perigo">
            Sair da Demonstração
          </Texto>
          <Texto variante="legenda" tom="secundaria">
            Encerre a sessão demonstrativa atual e retorne à tela de login. Os dados salvos localmente não serão apagados.
          </Texto>
        </View>

        <Botao
          titulo="Encerrar sessão"
          variante="secundaria"
          disabled={salvando}
          onPress={confirmarSaida}
          style={[estilos.botaoEncerrar, { borderColor: cores.perigo }]}
        />
      </Cartao>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  cabecalhoSecao: {
    gap: espacamentos.medio,
  },
  botaoVoltar: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: espacamentos.minimo,
  },
  textosTitulo: {
    gap: 4,
  },
  cartaoResumoPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.grande,
    padding: espacamentos.grande,
  },
  avatarGrande: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letraAvatarGrande: {
    fontSize: 28,
    fontWeight: '800',
  },
  infoResumoUsuario: {
    flex: 1,
    gap: 4,
  },
  badgeSessao: {
    alignSelf: 'flex-start',
    paddingHorizontal: espacamentos.medio,
    paddingVertical: 2,
    borderRadius: raios.capsula,
    borderWidth: 1,
    marginTop: 4,
  },
  textoBadgeSessao: {
    fontSize: 11,
    fontWeight: '700',
  },
  cartaoFormulario: {
    gap: espacamentos.grande,
    padding: espacamentos.grande,
  },
  topoFormulario: {
    gap: 4,
  },
  caixaSucesso: {
    padding: espacamentos.medio,
    borderRadius: raios.pequeno,
    borderWidth: 1,
  },
  conteudoSucesso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botaoSalvar: {
    marginTop: espacamentos.pequeno,
  },
  cartaoInfo: {
    gap: espacamentos.grande,
    padding: espacamentos.grande,
  },
  listaItensInfo: {
    gap: espacamentos.grande,
  },
  itemInfo: {
    gap: 4,
  },
  cabecalhoItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textoItemInfo: {
    lineHeight: 18,
  },
  cartaoSaida: {
    gap: espacamentos.grande,
    padding: espacamentos.grande,
    marginBottom: espacamentos.extraGrande,
  },
  topoSaida: {
    gap: 4,
  },
  botaoEncerrar: {
    marginTop: espacamentos.pequeno,
  },
});
