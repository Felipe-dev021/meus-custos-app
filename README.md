# Meus Custos — Mobile & Backend (P2)

Aplicativo mobile de controle financeiro pessoal, desenvolvido com **React Native**, **Expo SDK 58**, **Expo Router**, **TypeScript**, integrado a um **Backend NestJS** com **PostgreSQL** e suporte a sincronização na nuvem com fallback offline.

---

## 👥 Dupla
- **Felipe** (`Felipe-dev021`) — Front-end, 14 telas funcionais, consumo de API externa de cotações, estilização StyleSheet Flexbox, persistência local e testes unitários.
- **Lucas** (`Lucas`) — Backend NestJS, modelagem e integração de banco relacional PostgreSQL, autenticação resiliente, serviço de sincronização nuvem/local e vídeo demonstrativo.

---

## ✅ Requisitos Técnicos Atendidos (P2)
- **Expo SDK 58 & React Native 0.88** com navegação moderna via **Expo Router** (Typed Routes).
- **Estilização 100% com `StyleSheet` e Flexbox** + suporte nativo a **Tema Claro e Tema Escuro**.
- **14 Telas Funcionais** (superando a meta de 12 telas).
- **Backend Completo em NestJS**: Arquitetura modular, injeção de dependências e Prisma ORM.
- **Banco de Dados Relacional PostgreSQL**: Tabelas `usuarios`, `lancamentos`, `dividas`, `parcelas` e `orcamentos` com integridade referencial e chaves estrangeiras.
- **Sincronização em Nuvem Idempotente**: Envio (`push`) e restauração (`pull`) de lançamentos, dívidas e orçamentos entre `AsyncStorage` e `PostgreSQL`.
- **Modo Offline Resiliente**: Fallback seguro automático caso a conexão caia ou o servidor esteja offline, permitindo uso ininterrupto do app sem travamentos.
- **Consumo de API Externa**: Cotações de moedas em tempo real via AwesomeAPI (`src/servicos/apiCotacoes.ts`).
- **Despesas e Receitas Recorrentes com Intervalos Flexíveis**: Agendamento de despesas recorrentes (aluguel, assinaturas, parcelamentos) e receitas recorrentes (salários, pró-labore, rendimentos) com intervalos pré-definidos (7, 15, 21 ou 30 dias) ou personalizados em dias livres, com geração automática de parcelas/lançamentos e controle financeiro integrado.
- **Filtro e Previsão Mensal ('Previsto esse mês')**: Botão dinâmico nas telas de Receitas e Despesas que recalcula e exibe exclusivamente os lançamentos e métricas consolidadas dentro do mês atual civil.
- **Isolamento Completo de Dados por Usuário**: Cada conta possui armazenamento e identificação próprios no `AsyncStorage` e `PostgreSQL`, garantindo que novos cadastros iniciem limpos e contas de teste/demonstração fiquem estritamente isoladas.
- **99 Testes Automatizados** (`npm test`) cobrindo 100% das regras financeiras, persistência isolada por conta, sincronização, filtros mensais e recorrências.

---

## 🗄️ Backend & Banco de Dados (PostgreSQL + NestJS)

O backend do projeto foi estruturado no diretório `/backend` utilizando **NestJS** e **Prisma ORM** conectado ao **PostgreSQL**:

### Tabelas do Banco de Dados
1. **`usuarios`**: Cadastro, e-mail único, senha com hash bcrypt e timestamps.
2. **`lancamentos`**: Receitas e despesas com valores em centavos inteiros, datas civis, categorias e vínculos de parcelas.
3. **`dividas`**: Registro de compromissos parcelados por categoria.
4. **`parcelas`**: Parcelas vinculadas a dívidas com valor, vencimento, situação (`pendente`/`paga`) e chave para a despesa gerada.
5. **`orcamentos`**: Metas mensais de teto de gastos por categoria por usuário (`unique([usuario_id, categoria])`).

O script SQL de criação das tabelas e índices está disponível em [`backend/prisma/schema.sql`](backend/prisma/schema.sql).

### Endpoints da API REST
* `POST /api/auth/registro` — Cadastro de usuário com validação e hash seguro.
* `POST /api/auth/login` — Autenticação com e-mail/senha e retorno de perfil.
* `GET /api/auth/perfil/:id` — Consulta de perfil autenticado.
* `POST /api/sincronizacao` — Sincronização em lote dos dados locais com o PostgreSQL em transação atômica.
* `GET /api/sincronizacao/:usuarioId` — Download dos dados completos salvos no PostgreSQL para restauração de novo aparelho.
* `GET /api/lancamentos/usuario/:usuarioId` — Consulta de lançamentos.
* `GET /api/dividas/usuario/:usuarioId` — Consulta de dívidas e parcelas.
* `GET /api/orcamentos/usuario/:usuarioId` — Consulta de limites de orçamento.

---

## 📱 Inventário de Telas (14 Telas)

### Autenticação (`src/app/(auth)/`)
1. `login.tsx` — Login integrado ao PostgreSQL/NestJS com fallback seguro offline.
2. `registro.tsx` — Criação de conta conectada à API NestJS com validação em tempo real.

### Aplicativo (`src/app/(app)/`)
3. `index.tsx` — Visão Geral / Dashboard com saldo, previsão, gastos por categoria e atalhos rápidos.
4. `receitas.tsx` — Listagem de receitas com busca e ordenação por data/valor.
5. `despesas.tsx` — Listagem de despesas com filtros por situação (Pagas/Pendentes), busca e ordenação.
6. `novo-lancamento.tsx` — Cadastro de receitas e despesas com atalhos rápidos de valores.
7. `[id].tsx` — Detalhes, edição e gerenciamento do lançamento selecionado.
8. `dividas.tsx` — Controle de dívidas e quitação de parcelas.
9. `cotacoes.tsx` — Câmbio & Cotações em tempo real (AwesomeAPI) com conversor integrado ao saldo.
10. `relatorios.tsx` — Relatórios financeiros, diagnóstico de saúde e distribuição por categorias.
11. `categorias.tsx` — Gestão de categorias e metas/orçamentos mensais sincronizáveis.
12. `assistente.tsx` — Assistente financeiro local inteligente.
13. `perfil.tsx` — Perfil do usuário, status de sincronização e alternância de tema (Claro/Escuro).
14. `mais.tsx` — Menu central de atalhos e opções do aplicativo.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 20 ou superior)
- PostgreSQL (porta padrão 5432)
- Expo Go ou emulador Android/iOS

### 1. Iniciar o Banco de Dados e o Backend NestJS
Configure as variáveis em `backend/.env` (ou use os padrões do `backend/.env.example`):
```bash
# Na raiz do projeto, instale e inicie o backend:
cd backend
npm install
npm run start
```
> O backend iniciará em `http://localhost:3001` com CORS liberado.

### 2. Iniciar o Aplicativo Móvel (Expo)
Em outro terminal, na raiz do projeto:
```bash
npm install
npx expo start
```
Para visualizar:
- Pressione `a` para emulador Android.
- Pressione `w` para abrir no navegador Web.
- Ou escaneie o QR Code no seu celular físico com o app **Expo Go**.

---

## 🧪 Scripts e Verificações

- **Checagem de tipos TypeScript**: `npm run typecheck`
- **Linter de código**: `npm run lint`
- **Testes automatizados (99 testes passando)**: `npm test`

---

## 🎥 Vídeo Demonstrativo (Até 5 minutos)
- **Link do vídeo**: *(A ser adicionado pelo Lucas após a gravação demonstrando o app e o backend)*
