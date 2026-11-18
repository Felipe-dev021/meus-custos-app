import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LancamentosService {
  constructor(private readonly prisma: PrismaService) {}

  async listarPorUsuario(usuarioId: string) {
    return this.prisma.lancamento.findMany({
      where: { usuarioId },
      orderBy: { data: 'desc' },
    });
  }

  async obterPorId(id: string) {
    const lancamento = await this.prisma.lancamento.findUnique({
      where: { id },
    });
    if (!lancamento) throw new NotFoundException('Lançamento não encontrado.');
    return lancamento;
  }

  async criar(dados: any) {
    return this.prisma.lancamento.create({
      data: dados,
    });
  }

  async remover(id: string) {
    return this.prisma.lancamento.delete({
      where: { id },
    });
  }
}
