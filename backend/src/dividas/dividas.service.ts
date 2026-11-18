import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DividasService {
  constructor(private readonly prisma: PrismaService) {}

  async listarPorUsuario(usuarioId: string) {
    return this.prisma.divida.findMany({
      where: { usuarioId },
      include: {
        parcelas: { orderBy: { numero: 'asc' } },
      },
    });
  }

  async obterPorId(id: string) {
    const divida = await this.prisma.divida.findUnique({
      where: { id },
      include: {
        parcelas: { orderBy: { numero: 'asc' } },
      },
    });
    if (!divida) throw new NotFoundException('Dívida não encontrada.');
    return divida;
  }
}
