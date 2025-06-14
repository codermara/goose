import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoundsService } from '../rounds/rounds.service';

@Injectable()
export class TapsService {
  private readonly logger = new Logger(TapsService.name);

  constructor(
    private prisma: PrismaService,
    private roundsService: RoundsService,
  ) {}

  async create(roundId: string, userId: string, username: string) {
    return await this.prisma.$transaction(async (tx) => {
      const round = await tx.round.findUnique({
        where: { id: roundId },
      });

      if (!round) {
        throw new BadRequestException('Round not found');
      }

      const now = new Date();
      const isActive = now >= round.startDate && now <= round.endDate;
      
      if (!isActive) {
        throw new BadRequestException('Round is not active');
      }

      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.role === 'NIKITA') {
        return { points: 0 };
      }

      const existingTap = await tx.tap.findUnique({
        where: {
          userId_roundId: {
            userId,
            roundId,
          },
        },
      });

      const points = existingTap ? existingTap.points + 1 : 1;
      const bonusPoints = points % 11 === 0 ? 10 : 0;
      const totalPoints = points + bonusPoints;

      const tap = await tx.tap.upsert({
        where: {
          userId_roundId: {
            userId,
            roundId,
          },
        },
        update: {
          points: totalPoints,
        },
        create: {
          userId,
          roundId,
          points: totalPoints,
        },
      });

      this.logger.debug(`Tap recorded for user ${username} in round ${roundId}: ${totalPoints} points`);
      return { points: tap.points };
    }, {
      isolationLevel: 'Serializable',
      timeout: 5000,
    });
  }
} 