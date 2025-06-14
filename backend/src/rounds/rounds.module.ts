import { Module } from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { RoundsController } from './rounds.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [RoundsService, PrismaService],
  controllers: [RoundsController],
  exports: [RoundsService],
})
export class RoundsModule {} 