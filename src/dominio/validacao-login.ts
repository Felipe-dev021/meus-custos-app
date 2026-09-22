export type ErrosLogin = {
  email?: string;
  senha?: string;
};

/** Valida os campos de entrada da tela de login. */
export function validarCredenciaisLogin(email: string, senha: string): ErrosLogin {
  const erros: ErrosLogin = {};
  const emailLimpo = email.trim();

  if (!emailLimpo) {
    erros.email = 'Informe seu e-mail.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
    erros.email = 'Informe um e-mail válido.';
  } else if (emailLimpo.length > 254) {
    erros.email = 'O e-mail deve ter até 254 caracteres.';
  }

  if (!senha) {
    erros.senha = 'Informe sua senha.';
  } else if (senha.length < 6) {
    erros.senha = 'A senha deve ter no mínimo 6 caracteres.';
  }

  return erros;
}

export function temErrosLogin(erros: ErrosLogin): boolean {
  return Boolean(erros.email || erros.senha);
}

