import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { LancamentosService } from './lancamentos.service';

@Controller('api/lancamentos')
export class LancamentosController {
  constructor(private readonly lancamentosService: LancamentosService) {}

  @Get('usuario/:usuarioId')
  async listarPorUsuario(@Param('usuarioId') usuarioId: string) {
    return this.lancamentosService.listarPorUsuario(usuarioId);
  }

  @Get(':id')
  async obterPorId(@Param('id') id: string) {
    return this.lancamentosService.obterPorId(id);
  }

  @Post()
  async criar(@Body() dados: any) {
    return this.lancamentosService.criar(dados);
  }

  @Delete(':id')
  async remover(@Param('id') id: string) {
    return this.lancamentosService.remover(id);
  }
}
