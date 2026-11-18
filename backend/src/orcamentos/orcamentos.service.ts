import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrcamentosService {
  constructor(private readonly prisma: PrismaService) {}

  async listarPorUsuario(usuarioId: string) {
    return this.prisma.orcamento.findMany({
      where: { usuarioId },
    });
  }

  async definirOrcamento(usuarioId: string, categoria: string, limiteCentavos: number) {
    return this.prisma.orcamento.upsert({
      where: {
        usuarioId_categoria: { usuarioId, categoria },
      },
      create: {
        usuarioId,
        categoria,
        limiteCentavos,
      },
      update: {
        limiteCentavos,
      },
    });
  }
}
