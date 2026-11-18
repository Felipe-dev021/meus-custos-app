import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrcamentosService } from './orcamentos.service';

@Controller('api/orcamentos')
export class OrcamentosController {
  constructor(private readonly orcamentosService: OrcamentosService) {}

  @Get('usuario/:usuarioId')
  async listarPorUsuario(@Param('usuarioId') usuarioId: string) {
    return this.orcamentosService.listarPorUsuario(usuarioId);
  }

  @Post('usuario/:usuarioId')
  async definirOrcamento(
    @Param('usuarioId') usuarioId: string,
    @Body() body: { categoria: string; limiteCentavos: number },
  ) {
    return this.orcamentosService.definirOrcamento(usuarioId, body.categoria, body.limiteCentavos);
  }
}
