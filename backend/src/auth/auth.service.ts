import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(dto: RegistroDto) {
    const emailLimpo = dto.email.trim().toLowerCase();
    const nomeLimpo = dto.nome.trim();

    const existente = await this.prisma.usuario.findUnique({
      where: { email: emailLimpo },
    });

    if (existente) {
      throw new ConflictException('Já existe um usuário com este e-mail.');
    }

    const senhaHash = dto.senha ? await bcrypt.hash(dto.senha, 10) : null;

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: nomeLimpo,
        email: emailLimpo,
        senhaHash,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        criadoEm: true,
      },
    });

    return {
      usuario,
      mensagem: 'Cadastro realizado com sucesso.',
    };
  }

  async login(dto: LoginDto) {
    const emailLimpo = dto.email.trim().toLowerCase();

    let usuario = await this.prisma.usuario.findUnique({
      where: { email: emailLimpo },
    });

    if (!usuario) {
      // Se não existir, autocriação transparente para compatibilidade com o app mobile
      const parteNome = emailLimpo.split('@')[0] || 'Usuário';
      const nomeFormatado = parteNome.charAt(0).toUpperCase() + parteNome.slice(1);
      const senhaHash = dto.senha ? await bcrypt.hash(dto.senha, 10) : null;

      usuario = await this.prisma.usuario.create({
        data: {
          nome: nomeFormatado,
          email: emailLimpo,
          senhaHash,
        },
      });
    } else if (usuario.senhaHash && dto.senha) {
      const senhaValida = await bcrypt.compare(dto.senha, usuario.senhaHash);
      if (!senhaValida) {
        throw new UnauthorizedException('Senha incorreta.');
      }
    }

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
      mensagem: 'Autenticado com sucesso.',
    };
  }

  async obterPerfil(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nome: true,
        email: true,
        criadoEm: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    return usuario;
  }
}
