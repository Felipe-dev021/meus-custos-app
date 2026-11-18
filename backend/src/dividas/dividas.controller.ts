import { Controller, Get, Param } from '@nestjs/common';
import { DividasService } from './dividas.service';

@Controller('api/dividas')
export class DividasController {
  constructor(private readonly dividasService: DividasService) {}

  @Get('usuario/:usuarioId')
  async listarPorUsuario(@Param('usuarioId') usuarioId: string) {
    return this.dividasService.listarPorUsuario(usuarioId);
  }

  @Get(':id')
  async obterPorId(@Param('id') id: string) {
    return this.dividasService.obterPorId(id);
  }
}
