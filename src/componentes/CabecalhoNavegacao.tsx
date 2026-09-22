import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Texto } from '@/componentes/Texto';
import { useFinanceiro } from '@/estado/ContextoFinanceiro';
import { cores, espacamentos, raios } from '@/tema';

const logoImagem = require('../../assets/logo.png');

type RotaAtiva = 'visao-geral' | 'receitas' | 'despesas' | 'dividas' | 'assistente' | 'perfil';

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
  const { dados, executar, salvando } = useFinanceiro();
  const [menuAberto, definirMenuAberto] = useState(false);

  function navegarPara(caminho: string) {
    definirMenuAberto(false);
    navegador.push(caminho as any);
  }

  function sairDemonstracao() {
    definirMenuAberto(false);
    executar({ tipo: 'sair-demonstracao' });
  }

  const inicialPerfil = dados.perfil.nome ? dados.perfil.nome.charAt(0).toUpperCase() : 'U';

  return (
    <>
      {/* Barra superior com Logo e Botão Hambúrguer */}
      <View style={estilos.barraSuperior}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Meus Custos - Início"
          onPress={() => navegarPara('/(principal)/visao-geral')}
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
          style={estilos.botaoHamburguer}>
          <View style={estilos.linhaHamburguer} />
          <View style={estilos.linhaHamburguer} />
          <View style={estilos.linhaHamburguer} />
        </Pressable>
      </View>

      {/* Drawer Lateral (Menu Hambúrguer) */}
      <Modal
        visible={menuAberto}
        transparent
        animationType="fade"
        onRequestClose={() => definirMenuAberto(false)}>
        <View style={estilos.fundoModal}>
          {/* Toque fora para fechar */}
          <Pressable
            accessibilityLabel="Fechar menu"
            onPress={() => definirMenuAberto(false)}
            style={estilos.areaFechamento}
          />

          {/* Painel lateral do menu */}
          <View style={estilos.painelDrawer}>
            {/* Topo do drawer com logo e botão fechar [X] */}
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

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar menu"
                onPress={() => definirMenuAberto(false)}
                style={estilos.botaoFechar}>
                <Texto variante="corpo" tom="secundaria" style={estilos.textoFechar}>
                  ✕
                </Texto>
              </Pressable>
            </View>

            {/* Seção Financeiro */}
            <Texto variante="legenda" style={estilos.rotuloSecao}>
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
                    onPress={() => navegarPara(item.caminho)}
                    style={[
                      estilos.itemLink,
                      ativo && estilos.itemLinkAtivo,
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

            <View style={estilos.divisor} />

            {/* Alternador de Modo Escuro / Claro */}
            <View style={estilos.itemTema}>
              <Texto variante="legenda" tom="secundaria">
                ☼ Modo escuro ativo
              </Texto>
            </View>

            {/* Cartão de Perfil na base */}
            <View style={estilos.rodapeDrawer}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Acessar perfil"
                onPress={() => navegarPara('/perfil')}
                style={estilos.perfilConteudo}>
                <View style={estilos.avatarCirculo}>
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
    paddingVertical: espacamentos.medio,
    marginBottom: espacamentos.pequeno,
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
    borderColor: cores.borda,
    backgroundColor: cores.superficieElevada,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  linhaHamburguer: {
    width: 18,
    height: 2,
    backgroundColor: cores.texto,
    borderRadius: 1,
  },
  fundoModal: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
    backgroundColor: '#0c0c0e',
    borderRightWidth: 1,
    borderRightColor: cores.borda,
    paddingHorizontal: espacamentos.grande,
    paddingTop: espacamentos.amplo,
    paddingBottom: espacamentos.extraGrande,
    zIndex: 10,
  },
  topoDrawer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: espacamentos.grande,
  },
  botaoFechar: {
    width: 38,
    height: 38,
    borderRadius: raios.pequeno,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficieElevada,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoFechar: {
    fontSize: 16,
    fontWeight: '600',
  },
  rotuloSecao: {
    color: '#71717a',
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
  itemLinkAtivo: {
    backgroundColor: '#1c1c1f',
  },
  iconeLink: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  textoLink: {
    color: cores.textoSecundario,
  },
  textoLinkAtivo: {
    color: cores.primaria,
    fontWeight: '700',
  },
  divisor: {
    height: 1,
    backgroundColor: cores.borda,
    marginVertical: espacamentos.grande,
  },
  itemTema: {
    paddingHorizontal: espacamentos.pequeno,
    marginBottom: 'auto',
  },
  rodapeDrawer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: espacamentos.medio,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
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
    borderColor: cores.primaria,
    backgroundColor: cores.fundo,
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
