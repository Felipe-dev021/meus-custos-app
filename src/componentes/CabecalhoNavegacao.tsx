import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Texto } from '@/componentes/Texto';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { espacamentos, raios } from '@/tema';
import { useTema } from '@/tema/ContextoTema';

const logoImagem = require('../../assets/logo.png');

export type RotaAtiva =
  | 'visao-geral'
  | 'receitas'
  | 'despesas'
  | 'dividas'
  | 'assistente'
  | 'perfil';

type PropriedadesCabecalho = {
  rotaAtiva?: RotaAtiva;
};

const itensMenu: { id: RotaAtiva; rotulo: string; icone: string; caminho: string }[] = [
  { id: 'visao-geral', rotulo: 'Dashboard', icone: '◫', caminho: '/(principal)/visao-geral' },
  { id: 'receitas', rotulo: 'Receitas', icone: '↗', caminho: '/(principal)/receitas' },
  { id: 'despesas', rotulo: 'Despesas', icone: '💳', caminho: '/(principal)/despesas' },
  { id: 'dividas', rotulo: 'Dívidas', icone: '🏛', caminho: '/dividas' },
  { id: 'assistente', rotulo: 'Assistente IA', icone: '🤖', caminho: '/assistente' },
];

export function CabecalhoNavegacao({ rotaAtiva = 'visao-geral' }: PropriedadesCabecalho) {
  const navegador = useRouter();
  const insets = useSafeAreaInsets();
  const { dados, executar, salvando } = useFinanceiro();
  const { tema, cores, alternarTema } = useTema();
  const [menuAberto, definirMenuAberto] = useState(false);
  const navegandoRef = useRef(false);

  function navegarPara(caminho: string, idItem?: RotaAtiva) {
    definirMenuAberto(false);
    if (idItem === rotaAtiva) return;
    if (navegandoRef.current) return;

    navegandoRef.current = true;
    navegador.push(caminho as any);

    setTimeout(() => {
      navegandoRef.current = false;
    }, 250);
  }

  function sairDemonstracao() {
    definirMenuAberto(false);
    executar({ tipo: 'sair-demonstracao' });
  }

  const inicialPerfil = dados.perfil.nome ? dados.perfil.nome.charAt(0).toUpperCase() : 'U';

  const topoDrawerComInsets = Math.max(insets.top + espacamentos.medio, espacamentos.amplo);

  return (
    <>
      {/* Barra superior com Logo e Botão Hambúrguer */}
      <View style={estilos.barraSuperior}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Meus Custos - Início"
          onPress={() => navegarPara('/(principal)/visao-geral', 'visao-geral')}
          style={estilos.logoArea}>
          <Image
            source={logoImagem}
            style={estilos.logoImagem}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Logo Meus Custos"
          />
          <Texto tom="primaria" style={estilos.logoTexto}>
            {'meus\ncustos'}
          </Texto>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir menu de navegação"
          onPress={() => definirMenuAberto(true)}
          style={[
            estilos.botaoHamburguer,
            {
              borderColor: cores.borda,
              backgroundColor: cores.superficieElevada,
            },
          ]}>
          <View style={[estilos.linhaHamburguer, { backgroundColor: cores.texto }]} />
          <View style={[estilos.linhaHamburguer, { backgroundColor: cores.texto }]} />
          <View style={[estilos.linhaHamburguer, { backgroundColor: cores.texto }]} />
        </Pressable>
      </View>

      {/* Drawer Lateral (Menu Hambúrguer) */}
      <Modal
        visible={menuAberto}
        transparent
        animationType="fade"
        onRequestClose={() => definirMenuAberto(false)}>
        <View style={[estilos.fundoModal, { backgroundColor: cores.fundoModal }]}>
          {/* Toque fora para fechar */}
          <Pressable
            accessibilityLabel="Fechar menu"
            onPress={() => definirMenuAberto(false)}
            style={estilos.areaFechamento}
          />

          {/* Painel lateral do menu */}
          <View
            style={[
              estilos.painelDrawer,
              {
                paddingTop: topoDrawerComInsets,
                backgroundColor: cores.painelDrawer,
                borderRightColor: cores.borda,
              },
            ]}>
            {/* Topo do drawer com logo (sem botão [✕]) */}
            <View style={estilos.topoDrawer}>
              <View style={estilos.logoArea}>
                <Image
                  source={logoImagem}
                  style={estilos.logoImagem}
                  resizeMode="contain"
                  accessibilityRole="image"
                  accessibilityLabel="Logo Meus Custos"
                />
                <Texto tom="primaria" style={estilos.logoTexto}>
                  {'meus\ncustos'}
                </Texto>
              </View>
            </View>

            {/* Seção Financeiro */}
            <Texto
              variante="legenda"
              style={[estilos.rotuloSecao, { color: cores.textoMutado }]}>
              FINANCEIRO
            </Texto>

            <View style={estilos.listaLinks}>
              {itensMenu.map((item) => {
                const ativo = rotaAtiva === item.id;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={item.rotulo}
                    accessibilityState={{ selected: ativo }}
                    onPress={() => navegarPara(item.caminho, item.id)}
                    style={[
                      estilos.itemLink,
                      ativo && { backgroundColor: cores.itemLinkAtivo },
                    ]}>
                    <Texto
                      variante="rotulo"
                      tom={ativo ? 'primaria' : 'secundaria'}
                      style={estilos.iconeLink}>
                      {item.icone}
                    </Texto>
                    <Texto
                      variante="rotulo"
                      tom={ativo ? 'primaria' : 'padrao'}
                      style={ativo ? estilos.textoLinkAtivo : estilos.textoLink}>
                      {item.rotulo}
                    </Texto>
                  </Pressable>
                );
              })}
            </View>

            <View style={[estilos.divisor, { backgroundColor: cores.borda }]} />

            {/* Alternador de Modo Escuro / Claro */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Modo ${tema === 'escuro' ? 'escuro' : 'claro'} ativo. Toque para alternar o tema.`}
              onPress={alternarTema}
              style={[
                estilos.itemTema,
                {
                  backgroundColor: cores.superficieElevada,
                  borderColor: cores.borda,
                },
              ]}>
              <Texto variante="legenda" tom="secundaria" style={estilos.textoTema}>
                {tema === 'escuro' ? '☼ Modo escuro ativo' : '☾ Modo claro ativo'}
              </Texto>
            </Pressable>

            {/* Cartão de Perfil na base */}
            <View style={[estilos.rodapeDrawer, { borderTopColor: cores.borda }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Acessar perfil"
                onPress={() => navegarPara('/perfil', 'perfil')}
                style={estilos.perfilConteudo}>
                <View
                  style={[
                    estilos.avatarCirculo,
                    {
                      borderColor: cores.primaria,
                      backgroundColor: cores.fundo,
                    },
                  ]}>
                  <Texto variante="rotulo" tom="primaria" style={estilos.letraAvatar}>
                    {inicialPerfil}
                  </Texto>
                </View>
                <View style={estilos.infoPerfil}>
                  <Texto variante="rotulo" numberOfLines={1}>
                    {dados.perfil.nome || 'Meu Perfil'}
                  </Texto>
                  <Texto variante="legenda" tom="secundaria">
                    MEU PERFIL
                  </Texto>
                </View>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sair da demonstração"
                disabled={salvando}
                onPress={sairDemonstracao}
                style={estilos.botaoSair}>
                <Texto variante="rotulo" tom="secundaria">
                  ↪
                </Texto>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const estilos = StyleSheet.create({
  barraSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: espacamentos.medio + (Platform.OS === 'android' ? 4 : 0),
    paddingBottom: espacamentos.medio,
    marginBottom: espacamentos.pequeno,
    minHeight: 52,
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.medio,
  },
  logoImagem: {
    width: 36,
    height: 36,
  },
  logoTexto: {
    fontSize: 16,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  botaoHamburguer: {
    width: 44,
    height: 44,
    borderRadius: raios.pequeno,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  linhaHamburguer: {
    width: 18,
    height: 2,
    borderRadius: 1,
  },
  fundoModal: {
    flex: 1,
    flexDirection: 'row',
  },
  areaFechamento: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  painelDrawer: {
    width: '82%',
    maxWidth: 320,
    height: '100%',
    borderRightWidth: 1,
    paddingHorizontal: espacamentos.grande,
    paddingBottom: espacamentos.extraGrande,
    zIndex: 10,
  },
  topoDrawer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: espacamentos.grande,
  },
  rotuloSecao: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: espacamentos.grande,
    marginBottom: espacamentos.pequeno,
    paddingHorizontal: espacamentos.pequeno,
  },
  listaLinks: {
    gap: espacamentos.minimo,
  },
  itemLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.medio,
    paddingHorizontal: espacamentos.medio,
    paddingVertical: espacamentos.medio,
    borderRadius: raios.pequeno,
  },
  iconeLink: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  textoLink: {},
  textoLinkAtivo: {
    fontWeight: '700',
  },
  divisor: {
    height: 1,
    marginVertical: espacamentos.grande,
  },
  itemTema: {
    paddingHorizontal: espacamentos.medio,
    paddingVertical: espacamentos.medio,
    borderRadius: raios.pequeno,
    borderWidth: 1,
    marginBottom: 'auto',
  },
  textoTema: {
    fontWeight: '500',
  },
  rodapeDrawer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: espacamentos.medio,
    borderTopWidth: 1,
  },
  perfilConteudo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.medio,
  },
  avatarCirculo: {
    width: 38,
    height: 38,
    borderRadius: raios.capsula,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letraAvatar: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoPerfil: {
    flex: 1,
    gap: 1,
  },
  botaoSair: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
