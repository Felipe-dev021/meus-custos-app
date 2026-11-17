# Meus Custos — Mobile (P2)

Aplicativo mobile de controle financeiro pessoal, desenvolvido com **React Native**, **Expo SDK 58**, **Expo Router** e **TypeScript**.

---

## 👥 Dupla
- **Felipe** (`Felipe-dev021`) — Front-end, telas, consumo de API, armazenamento local, responsividade e testes unitários.
- **Lucas** (`Lucas`) — Backend, banco de dados, sincronização remota e vídeo demonstrativo.

---

## ✅ Requisitos Técnicos Atendidos (P2)
- **Expo SDK 58 & React Native 0.88** com navegação via **Expo Router**.
- **Estilização 100% com `StyleSheet` e Flexbox** + suporte a **Tema Claro e Tema Escuro**.
- **14 Telas Funcionais** (superando o mínimo de 12 telas).
- **Consumo de API Externa**: Cotação em tempo real de Dólar, Euro e Bitcoin via AwesomeAPI (`src/servicos/apiCotacoes.ts`).
- **Armazenamento Local (`AsyncStorage`)**: Persistência de lançamentos, dívidas, orçamentos por categoria, tema e cache offline de cotações.
- **76 Testes Automatizados** (`npm test`) cobrindo regras de negócio, validações, relatórios, cotações e orçamentos.

---

## 📱 Inventário de Telas (14 Telas)

### Autenticação (`src/app/(auth)/`)
1. `login.tsx` — Login com validação de campos e acesso demonstrativo.
2. `registro.tsx` — Criação de conta com validação em tempo real.

### Aplicativo (`src/app/(app)/`)
3. `index.tsx` — Visão Geral / Dashboard com saldo, previsão, gastos por categoria e atalhos rápidos.
4. `receitas.tsx` — Listagem de receitas com busca e ordenação por data/valor.
5. `despesas.tsx` — Listagem de despesas com filtros por situação (Pagas/Pendentes), busca e ordenação.
6. `novo-lancamento.tsx` — Cadastro de receitas e despesas com atalhos rápidos de valores.
7. `[id].tsx` — Detalhes, edição e gerenciamento do lançamento selecionado.
8. `dividas.tsx` — Controle de dívidas e quitação de parcelas.
9. `cotacoes.tsx` — Câmbio & Cotações em tempo real (API) com conversor integrado ao saldo.
10. `relatorios.tsx` — Relatórios financeiros, diagnóstico de saúde e distribuição por categorias.
11. `categorias.tsx` — Gestão de categorias e metas/orçamentos mensais com persistência local.
12. `assistente.tsx` — Assistente financeiro local inteligente.
13. `perfil.tsx` — Perfil do usuário e alternância de tema (Claro/Escuro).
14. `mais.tsx` — Menu central de atalhos e opções do aplicativo.

---

## 🚀 Como executar o projeto

### Pré-requisitos
- Node.js (versão 20 ou superior)
- npm
- Aplicativo **Expo Go** (versão compatível com Expo SDK 58) no celular ou emulador Android/iOS

### 1. Instalar as dependências
```bash
npm install
```

### 2. Iniciar o servidor de desenvolvimento
```bash
npx expo start
```
> No Windows/PowerShell (caso haja restrição de scripts), utilize `npx.cmd expo start`.

Para visualizar o aplicativo:
- Pressione `a` para abrir no emulador Android.
- Pressione `i` para abrir no simulador iOS.
- Pressione `w` para abrir no navegador web.
- Ou escaneie o QR Code com o aplicativo **Expo Go** no seu smartphone.

---

## 🧪 Scripts e Verificações

- **Checagem de tipos TypeScript**: `npm run typecheck`
- **Linter de código**: `npm run lint`
- **Testes automatizados (76 testes)**: `npm test`

---

## 📁 Estrutura do Projeto

- `src/app/`: Telas e navegação do aplicativo (Expo Router).
- `src/componentes/`: Componentes visuais reutilizáveis (botões, cartões, cabeçalho, inputs, etc.).
- `src/contexto/`: Contexto de autenticação (`AuthContext`).
- `src/estado/`: Contexto e gerenciamento do estado financeiro compartilhado.
- `src/dominio/`: Modelos, regras de negócio, validações, relatórios e orçamentos.
- `src/servicos/`: Serviços de integração com API externa (`apiCotacoes.ts`).
- `src/dados/`: Dados de demonstração e persistência local (AsyncStorage).
- `src/tema/`: Tokens de design e alternância de temas claro/escuro.
- `assets/`: Imagens e ícones da aplicação.
- `testes/`: Suíte de testes unitários das regras de negócio.

---

## 🎥 Vídeo Demonstrativo (Até 5 minutos)
- **Link do vídeo**: *(A ser adicionado pelo Lucas após a gravação)*
