import { Controller, Get, Post, Param, UseGuards, Logger } from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('rounds')
@UseGuards(JwtAuthGuard)
export class RoundsController {
  private readonly logger = new Logger(RoundsController.name);

  constructor(private readonly roundsService: RoundsService) {}

  @Get()
  async findAll() {
    this.logger.debug('Attempting to fetch all rounds');
    try {
      const rounds = await this.roundsService.findAll();
      this.logger.debug(`Successfully fetched ${rounds.length} rounds`);
      return rounds;
    } catch (error) {
      this.logger.error(`Failed to fetch rounds: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.debug(`Attempting to fetch round with id: ${id}`);
    try {
      const round = await this.roundsService.findOne(id);
      this.logger.debug(`Successfully fetched round: ${JSON.stringify(round)}`);
      return round;
    } catch (error) {
      this.logger.error(`Failed to fetch round ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create() {
    this.logger.debug('Attempting to create new round');
    try {
      const round = await this.roundsService.create();
      this.logger.debug(`Successfully created round: ${JSON.stringify(round)}`);
      return round;
    } catch (error) {
      this.logger.error(`Failed to create round: ${error.message}`, error.stack);
      throw error;
    }
  }
} 