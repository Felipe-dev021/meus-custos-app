import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { CabecalhoNavegacao } from '@/componentes/CabecalhoNavegacao';
import { Cartao } from '@/componentes/Cartao';
import { Tela } from '@/componentes/Tela';
import { Texto } from '@/componentes/Texto';
import {
  ContextoDadosAssistente,
  MensagemChat,
  SUGESTOES_PERGUNTAS,
  obterMensagemInicial,
  responderPerguntaFinanceira,
} from '@/dominio/assistente';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { espacamentos, raios } from '@/tema';
import { useTema } from '@/tema/ContextoTema';

export default function TelaAssistente() {
  const { dados, resumo, resumoDividas, receitas, despesas, gastosPorCategoria } = useFinanceiro();
  const { cores } = useTema();

  const [mensagens, definirMensagens] = useState<MensagemChat[]>(() => [
    obterMensagemInicial(dados.perfil.nome),
  ]);
  const [textoEntrada, definirTextoEntrada] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const contadorRef = useRef(1);

  const contextoDados = useMemo<ContextoDadosAssistente>(
    () => ({
      resumo,
      resumoDividas,
      gastosPorCategoria,
      receitas,
      despesas,
      nomeUsuario: dados.perfil.nome,
    }),
    [resumo, resumoDividas, gastosPorCategoria, receitas, despesas, dados.perfil.nome],
  );

  function rolarParaOFim() {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }

  function enviarMensagem(textoParaEnviar?: string) {
    const textoFinal = (textoParaEnviar ?? textoEntrada).trim();
    if (!textoFinal) return;

    const contador = contadorRef.current;
    contadorRef.current += 2;

    const mensagemUsuario: MensagemChat = {
      id: `usr-${contador}`,
      remetente: 'usuario',
      texto: textoFinal,
      horario: 'agora',
    };

    const respostaAssistente: MensagemChat = {
      id: `ast-${contador + 1}`,
      remetente: 'assistente',
      texto: responderPerguntaFinanceira(textoFinal, contextoDados),
      horario: 'agora',
    };

    definirMensagens((atuais) => [...atuais, mensagemUsuario, respostaAssistente]);
    definirTextoEntrada('');
    rolarParaOFim();
  }

  function limparConversa() {
    Alert.alert(
      'Limpar conversa',
      'Deseja apagar o histórico de mensagens desta sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            definirMensagens([obterMensagemInicial(dados.perfil.nome)]);
          },
        },
      ],
    );
  }

  return (
    <Tela edges={['top', 'right', 'left']}>
      {/* Topo com Logo e Menu Hambúrguer */}
      <CabecalhoNavegacao rotaAtiva="assistente" />

      {/* Cabeçalho da Seção */}
      <View style={estilos.cabecalhoSecao}>
        <View style={estilos.textosTitulo}>
          <Texto variante="titulo" accessibilityRole="header">
            Assistente Financeiro
          </Texto>
          <Texto tom="secundaria">
            Tire dúvidas e consulte indicadores financeiros instantaneamente
          </Texto>
        </View>
      </View>

      {/* Banner de Identificação de Simulação Local */}
      <View
        style={[
          estilos.bannerSimulado,
          {
            backgroundColor: cores.superficieElevada,
            borderColor: cores.borda,
          },
        ]}>
        <View style={estilos.iconeAviso}>
          <Ionicons name="sparkles-outline" size={18} color={cores.primaria} />
        </View>
        <Texto variante="legenda" tom="secundaria" style={estilos.textoAvisoSimulado}>
          <Texto variante="legenda" tom="primaria" style={estilos.textoNegritoAviso}>
            Respostas simuladas locais:
          </Texto>{' '}
          Este assistente funciona totalmente no seu aparelho, sem envio de dados ou conexão com APIs externas de IA.
        </Texto>
      </View>

      {/* Sugestões de Perguntas Rápidas */}
      <View style={estilos.secaoSugestoes}>
        <Texto variante="legenda" style={[estilos.rotuloSugestoes, { color: cores.textoMutado }]}>
          PERGUNTAS SUGERIDAS
        </Texto>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={estilos.listaSugestoes}>
          {SUGESTOES_PERGUNTAS.map((sugestao) => (
            <Pressable
              key={sugestao}
              accessibilityRole="button"
              accessibilityLabel={`Enviar pergunta: ${sugestao}`}
              onPress={() => enviarMensagem(sugestao)}
              style={[
                estilos.chipSugestao,
                {
                  backgroundColor: cores.superficieElevada,
                  borderColor: cores.borda,
                },
              ]}>
              <Texto variante="legenda" style={{ color: cores.texto }}>
                {sugestao}
              </Texto>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Painel do Chat */}
      <Cartao
        style={[
          estilos.painelChat,
          {
            backgroundColor: cores.cartaoMetrica,
            borderColor: cores.borda,
          },
        ]}>
        {/* Barra de Topo do Chat com Ação de Limpeza */}
        <View style={estilos.topoChat}>
          <View style={estilos.infoChatStatus}>
            <View style={[estilos.pontoOnline, { backgroundColor: cores.primaria }]} />
            <Texto variante="rotulo">Chat Financeiro</Texto>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpar mensagens da conversa"
            onPress={limparConversa}
            style={estilos.botaoLimpar}>
            <Texto variante="legenda" tom="secundaria">
              Limpar conversa
            </Texto>
          </Pressable>
        </View>

        <View style={[estilos.divisorChat, { backgroundColor: cores.borda }]} />

        {/* Área de Mensagens */}
        <ScrollView
          ref={scrollRef}
          style={estilos.areaMensagens}
          contentContainerStyle={estilos.conteudoMensagens}
          nestedScrollEnabled>
          {mensagens.map((msg) => {
            const ehUsuario = msg.remetente === 'usuario';

            return (
              <View
                key={msg.id}
                style={[
                  estilos.linhaMensagem,
                  ehUsuario ? estilos.linhaUsuario : estilos.linhaAssistente,
                ]}>
                {!ehUsuario && (
                  <View style={[estilos.avatarBot, { backgroundColor: cores.superficieElevada }]}>
                    <Ionicons name="sparkles" size={15} color={cores.primaria} />
                  </View>
                )}

                <View
                  style={[
                    estilos.balaoMensagem,
                    ehUsuario
                      ? [
                          estilos.balaoUsuario,
                          {
                            backgroundColor: cores.superficieElevada,
                            borderColor: cores.primaria,
                          },
                        ]
                      : [
                          estilos.balaoAssistente,
                          {
                            backgroundColor: cores.superficie,
                            borderColor: cores.borda,
                          },
                        ],
                  ]}>
                  <Texto
                    variante="corpo"
                    style={[
                      estilos.textoMensagem,
                      { color: cores.texto },
                    ]}>
                    {msg.texto}
                  </Texto>
                  <Texto
                    variante="legenda"
                    style={[estilos.horarioMensagem, { color: cores.textoMutado }]}>
                    {msg.horario}
                  </Texto>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Campo de Envio de Mensagem */}
        <View style={[estilos.areaEntrada, { borderTopColor: cores.borda }]}>
          <TextInput
            placeholder="Faça uma pergunta sobre suas finanças..."
            placeholderTextColor={cores.textoSecundario}
            value={textoEntrada}
            onChangeText={definirTextoEntrada}
            onSubmitEditing={() => enviarMensagem()}
            returnKeyType="send"
            style={[
              estilos.campoEntrada,
              {
                backgroundColor: cores.superficieElevada,
                borderColor: cores.borda,
                color: cores.texto,
              },
            ]}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enviar mensagem"
            disabled={!textoEntrada.trim()}
            onPress={() => enviarMensagem()}
            style={[
              estilos.botaoEnviar,
              {
                backgroundColor: textoEntrada.trim() ? cores.primaria : cores.borda,
                opacity: textoEntrada.trim() ? 1 : 0.6,
              },
            ]}>
            <Ionicons
              name="send"
              size={15}
              color={textoEntrada.trim() ? cores.sobrePrimaria : cores.textoSecundario}
            />
          </Pressable>
        </View>
      </Cartao>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  cabecalhoSecao: {
    gap: espacamentos.medio,
  },
  textosTitulo: {
    gap: 4,
  },
  bannerSimulado: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: espacamentos.medio,
    borderRadius: raios.pequeno,
    borderWidth: 1,
    gap: espacamentos.medio,
  },
  iconeAviso: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoAvisoSimulado: {
    flex: 1,
    lineHeight: 18,
  },
  textoNegritoAviso: {
    fontWeight: '700',
  },
  secaoSugestoes: {
    gap: espacamentos.pequeno,
  },
  rotuloSugestoes: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  listaSugestoes: {
    gap: espacamentos.pequeno,
  },
  chipSugestao: {
    paddingHorizontal: espacamentos.grande,
    paddingVertical: espacamentos.pequeno,
    borderRadius: raios.capsula,
    borderWidth: 1,
  },
  painelChat: {
    flex: 1,
    minHeight: 460,
    padding: 0,
    borderRadius: raios.medio,
    overflow: 'hidden',
  },
  topoChat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espacamentos.grande,
    paddingVertical: espacamentos.medio,
  },
  infoChatStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.pequeno,
  },
  pontoOnline: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  botaoLimpar: {
    paddingVertical: 4,
    paddingHorizontal: espacamentos.pequeno,
  },
  divisorChat: {
    height: 1,
  },
  areaMensagens: {
    flex: 1,
    paddingHorizontal: espacamentos.grande,
  },
  conteudoMensagens: {
    paddingVertical: espacamentos.grande,
    gap: espacamentos.grande,
  },
  linhaMensagem: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: espacamentos.pequeno,
    width: '100%',
  },
  linhaUsuario: {
    justifyContent: 'flex-end',
  },
  linhaAssistente: {
    justifyContent: 'flex-start',
  },
  avatarBot: {
    width: 28,
    height: 28,
    borderRadius: raios.capsula,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emojiAvatar: {
    fontSize: 14,
  },
  balaoMensagem: {
    maxWidth: '82%',
    paddingHorizontal: espacamentos.grande,
    paddingVertical: espacamentos.medio,
    borderRadius: raios.medio,
    borderWidth: 1,
    gap: 4,
  },
  balaoUsuario: {
    borderBottomRightRadius: 2,
  },
  balaoAssistente: {
    borderBottomLeftRadius: 2,
  },
  textoMensagem: {
    fontSize: 14,
    lineHeight: 20,
  },
  horarioMensagem: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  areaEntrada: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: espacamentos.medio,
    borderTopWidth: 1,
    gap: espacamentos.pequeno,
  },
  campoEntrada: {
    flex: 1,
    height: 44,
    paddingHorizontal: espacamentos.grande,
    borderRadius: raios.pequeno,
    borderWidth: 1,
    fontSize: 14,
  },
  botaoEnviar: {
    width: 44,
    height: 44,
    borderRadius: raios.pequeno,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setaEnviar: {
    fontSize: 16,
  },
});
