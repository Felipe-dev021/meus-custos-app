# Meus Custos — protótipo mobile

Projeto Expo com React Native, TypeScript e Expo Router.
Tema escuro e componentes nativos reutilizáveis. A tela inicial apresenta a identidade visual;
as telas e operações financeiras ainda serão implementadas.

```sh
npm install
npm start
```

Abra no Expo Go compatível com o SDK 57 ou pressione `w` para abrir na web.
No PowerShell com scripts bloqueados, use `npm.cmd` no lugar de `npm`.

Verificações: `npm run typecheck`, `npm run lint` e `npm test` (Node.js 22.18+).

Os modelos ficam em `src/dominio`, os dados fictícios em `src/dados` e a formatação em
`src/utilitarios`. Valores usam centavos inteiros e datas usam `AAAA-MM-DD`, sem horário.
Os dados ainda não estão conectados às telas nem persistidos no aparelho.

As consultas de `src/dominio/consultas-financeiras.ts` calculam o saldo com receitas recebidas
menos despesas pagas. A previsão desconta também as despesas pendentes cadastradas;
parcelas ainda sem lançamento não entram nessa previsão. Os gastos por categoria consideram
apenas despesas pagas. Os totais abrangem todos os lançamentos, sem filtro de mês.

Use português nos nomes de arquivos, componentes, tipos, funções e variáveis do projeto,
sem acentos nos identificadores. Preserve os nomes exigidos pelas bibliotecas e ferramentas.
