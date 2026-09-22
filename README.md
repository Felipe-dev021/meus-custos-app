# Meus Custos — Mobile

Aplicativo mobile do sistema Meus Custos, desenvolvido com React Native, Expo e TypeScript.

---

## 🚀 Como executar o projeto

### Pré-requisitos
- Node.js (versão 20 ou superior)
- npm

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

- **Checagem de tipos**: `npm run typecheck`
- **Linter de código**: `npm run lint`
- **Testes automatizados**: `npm test`

---

## 📁 Estrutura do Projeto

- `src/app/`: Telas e navegação do aplicativo (Expo Router).
- `src/componentes/`: Componentes visuais reutilizáveis (botões, cartões, cabeçalho, inputs, etc.).
- `src/estado/`: Contexto e gerenciamento do estado financeiro compartilhado.
- `src/dominio/`: Modelos, regras de negócio e cálculos financeiros.
- `src/dados/`: Dados fictícios e persistência local (AsyncStorage).
- `src/tema/`: Tokens de design (cores, espaçamentos e raios).
- `assets/`: Imagens e ícones da aplicação.
- `testes/`: Testes unitários das regras de negócio.

