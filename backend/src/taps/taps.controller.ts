import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { TapsService } from './taps.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('taps')
export class TapsController {
  constructor(private tapsService: TapsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':roundId')
  create(@Param('roundId') roundId: string, @Request() req) {
    return this.tapsService.create(roundId, req.user.id, req.user.username);
  }
} 