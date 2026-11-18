import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SincronizacaoPushDto } from './dto/sincronizacao.dto';

@Injectable()
export class SincronizacaoService {
  constructor(private readonly prisma: PrismaService) {}

  async sincronizar(dto: SincronizacaoPushDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: dto.usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado para sincronização.');
    }

    return this.prisma.$transaction(async (tx) => {
      let lancamentosProcessados = 0;
      let dividasProcessadas = 0;
      let orcamentosProcessados = 0;

      // 1. Sincroniza lançamentos
      if (dto.lancamentos && dto.lancamentos.length > 0) {
        for (const l of dto.lancamentos) {
          await tx.lancamento.upsert({
            where: { id: l.id },
            create: {
              id: l.id,
              usuarioId: usuario.id,
              descricao: l.descricao,
              valorCentavos: l.valorCentavos,
              data: l.data,
              tipo: l.tipo,
              categoria: l.categoria,
              situacao: l.situacao,
              origemTipo: l.origemTipo ?? null,
              origemDividaId: l.origemDividaId ?? null,
              origemParcelaId: l.origemParcelaId ?? null,
              dataPagamento: l.dataPagamento ?? null,
            },
            update: {
              descricao: l.descricao,
              valorCentavos: l.valorCentavos,
              data: l.data,
              tipo: l.tipo,
              categoria: l.categoria,
              situacao: l.situacao,
              origemTipo: l.origemTipo ?? null,
              origemDividaId: l.origemDividaId ?? null,
              origemParcelaId: l.origemParcelaId ?? null,
              dataPagamento: l.dataPagamento ?? null,
            },
          });
          lancamentosProcessados++;
        }
      }

      // 2. Sincroniza dívidas e parcelas
      if (dto.dividas && dto.dividas.length > 0) {
        for (const d of dto.dividas) {
          await tx.divida.upsert({
            where: { id: d.id },
            create: {
              id: d.id,
              usuarioId: usuario.id,
              descricao: d.descricao,
              categoria: d.categoria,
            },
            update: {
              descricao: d.descricao,
              categoria: d.categoria,
            },
          });

          if (d.parcelas && d.parcelas.length > 0) {
            for (const p of d.parcelas) {
              await tx.parcela.upsert({
                where: { id: p.id },
                create: {
                  id: p.id,
                  dividaId: d.id,
                  numero: p.numero,
                  valorCentavos: p.valorCentavos,
                  dataVencimento: p.dataVencimento,
                  situacao: p.situacao,
                  despesaId: p.despesaId ?? null,
                  dataPagamento: p.dataPagamento ?? null,
                },
                update: {
                  numero: p.numero,
                  valorCentavos: p.valorCentavos,
                  dataVencimento: p.dataVencimento,
                  situacao: p.situacao,
                  despesaId: p.despesaId ?? null,
                  dataPagamento: p.dataPagamento ?? null,
                },
              });
            }
          }
          dividasProcessadas++;
        }
      }

      // 3. Sincroniza orçamentos
      if (dto.orcamentos && dto.orcamentos.length > 0) {
        for (const o of dto.orcamentos) {
          await tx.orcamento.upsert({
            where: {
              usuarioId_categoria: {
                usuarioId: usuario.id,
                categoria: o.categoria,
              },
            },
            create: {
              usuarioId: usuario.id,
              categoria: o.categoria,
              limiteCentavos: o.limiteCentavos,
            },
            update: {
              limiteCentavos: o.limiteCentavos,
            },
          });
          orcamentosProcessados++;
        }
      }

      return {
        sucesso: true,
        sincronizadoEm: new Date().toISOString(),
        totais: {
          lancamentos: lancamentosProcessados,
          dividas: dividasProcessadas,
          orcamentos: orcamentosProcessados,
        },
      };
    });
  }

  async obterDadosCompletos(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        lancamentos: { orderBy: { data: 'desc' } },
        dividas: {
          include: {
            parcelas: { orderBy: { numero: 'asc' } },
          },
        },
        orcamentos: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
      lancamentos: usuario.lancamentos,
      dividas: usuario.dividas,
      orcamentos: usuario.orcamentos,
      sincronizadoEm: new Date().toISOString(),
    };
  }
}
