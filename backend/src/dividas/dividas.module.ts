import { Module } from '@nestjs/common';
import { DividasController } from './dividas.controller';
import { DividasService } from './dividas.service';

@Module({
  controllers: [DividasController],
  providers: [DividasService],
  exports: [DividasService],
})
export class DividasModule {}
