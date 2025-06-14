import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RoundsService {
  private readonly logger = new Logger(RoundsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async create() {
    try {
      this.logger.debug('Creating new round');
      const roundDuration = parseInt(this.configService.get('ROUND_DURATION') || '60');
      const cooldownDuration = parseInt(this.configService.get('COOLDOWN_DURATION') || '30');

      const startDate = new Date(Date.now() + cooldownDuration * 1000);
      const endDate = new Date(startDate.getTime() + roundDuration * 1000);

      const round = await this.prisma.$transaction(async (tx) => {
        const newRound = await tx.round.create({
          data: {
            startDate,
            endDate,
          },
        });
        this.logger.debug(`Round created successfully: ${newRound.id}`);
        return newRound;
      });

      return round;
    } catch (error) {
      this.logger.error(`Error creating round: ${error.message}`);
      throw error;
    }
  }

  async findAll() {
    try {
      this.logger.debug('Fetching all rounds');
      const rounds = await this.prisma.round.findMany({
        select: {
          id: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          startDate: 'desc',
        },
      });
      this.logger.debug(`Found ${rounds.length} rounds`);
      return rounds;
    } catch (error) {
      this.logger.error(`Error fetching rounds: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      this.logger.debug(`Fetching round with id: ${id}`);
      return await this.prisma.$transaction(async (tx) => {
        const round = await tx.round.findUnique({
          where: { id },
          include: {
            taps: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        });

        if (!round) {
          this.logger.debug(`Round not found: ${id}`);
          throw new BadRequestException('Round not found');
        }

        const now = new Date();
        const isActive = now >= round.startDate && now <= round.endDate;
        const isCooldown = now < round.startDate;
        const isFinished = now > round.endDate;

        const tapsByUser = round.taps.reduce((acc, tap) => {
          if (!acc[tap.userId]) {
            acc[tap.userId] = {
              username: tap.user.username,
              points: 0,
            };
          }
          acc[tap.userId].points += tap.points;
          return acc;
        }, {} as Record<string, { username: string; points: number }>);

        const winner = Object.entries(tapsByUser).reduce(
          (max, [_, user]) => (user.points > max.points ? user : max),
          { username: '', points: 0 },
        );

        this.logger.debug(`Round ${id} status: ${isActive ? 'active' : isCooldown ? 'cooldown' : 'finished'}`);
        return {
          ...round,
          status: isActive ? 'active' : isCooldown ? 'cooldown' : 'finished',
          tapsByUser,
          winner: isFinished ? winner : null,
        };
      });
    } catch (error) {
      this.logger.error(`Error fetching round ${id}: ${error.message}`);
      throw error;
    }
  }

  async isActive(id: string) {
    try {
      this.logger.debug(`Checking if round is active: ${id}`);
      return await this.prisma.$transaction(async (tx) => {
        const round = await tx.round.findUnique({
          where: { id },
          select: {
            startDate: true,
            endDate: true,
          },
        });

        if (!round) {
          this.logger.debug(`Round not found: ${id}`);
          throw new BadRequestException('Round not found');
        }

        const now = new Date();
        const isActive = now >= round.startDate && now <= round.endDate;
        this.logger.debug(`Round ${id} active status: ${isActive}`);
        return isActive;
      });
    } catch (error) {
      this.logger.error(`Error checking round status ${id}: ${error.message}`);
      throw error;
    }
  }
} 