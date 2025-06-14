import { Module } from '@nestjs/common';
import { TapsService } from './taps.service';
import { TapsController } from './taps.controller';
import { PrismaService } from '../prisma/prisma.service';
import { RoundsModule } from '../rounds/rounds.module';

@Module({
  imports: [RoundsModule],
  providers: [TapsService, PrismaService],
  controllers: [TapsController],
})
export class TapsModule {} 