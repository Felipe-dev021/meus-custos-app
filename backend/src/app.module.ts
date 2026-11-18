import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DividasModule } from './dividas/dividas.module';
import { LancamentosModule } from './lancamentos/lancamentos.module';
import { OrcamentosModule } from './orcamentos/orcamentos.module';
import { PrismaModule } from './prisma/prisma.module';
import { SincronizacaoModule } from './sincronizacao/sincronizacao.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    SincronizacaoModule,
    LancamentosModule,
    DividasModule,
    OrcamentosModule,
  ],
})
export class AppModule {}
