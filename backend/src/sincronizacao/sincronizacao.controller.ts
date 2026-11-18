import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SincronizacaoPushDto } from './dto/sincronizacao.dto';
import { SincronizacaoService } from './sincronizacao.service';

@Controller('api/sincronizacao')
export class SincronizacaoController {
  constructor(private readonly sincronizacaoService: SincronizacaoService) {}

  @Post()
  async sincronizar(@Body() dto: SincronizacaoPushDto) {
    return this.sincronizacaoService.sincronizar(dto);
  }

  @Get(':usuarioId')
  async obterDados(@Param('usuarioId') usuarioId: string) {
    return this.sincronizacaoService.obterDadosCompletos(usuarioId);
  }
}
