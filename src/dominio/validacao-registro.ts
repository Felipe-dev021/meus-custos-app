export type ErrosRegistro = {
  nome?: string;
  email?: string;
  senha?: string;
  confirmacaoSenha?: string;
};

/** Valida os campos de entrada da tela de cadastro de novo usuário. */
export function validarCamposRegistro(
  nome: string,
  email: string,
  senha: string,
  confirmacaoSenha: string,
): ErrosRegistro {
  const erros: ErrosRegistro = {};
  const nomeLimpo = nome.trim();
  const emailLimpo = email.trim();

  if (!nomeLimpo) {
    erros.nome = 'Informe seu nome completo.';
  } else if (nomeLimpo.length < 2) {
    erros.nome = 'O nome deve ter no mínimo 2 caracteres.';
  }

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

  if (!confirmacaoSenha) {
    erros.confirmacaoSenha = 'Confirme sua senha.';
  } else if (senha !== confirmacaoSenha) {
    erros.confirmacaoSenha = 'As senhas não coincidem.';
  }

  return erros;
}

export function temErrosRegistro(erros: ErrosRegistro): boolean {
  return Boolean(
    erros.nome || erros.email || erros.senha || erros.confirmacaoSenha,
  );
}
