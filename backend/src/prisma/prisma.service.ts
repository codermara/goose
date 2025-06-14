import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    try {
      this.logger.debug('Connecting to database...');
      await this.$connect();
      this.logger.debug('Successfully connected to database');
    } catch (error) {
      this.logger.error(`Failed to connect to database: ${error.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      this.logger.debug('Disconnecting from database...');
      await this.$disconnect();
      this.logger.debug('Successfully disconnected from database');
    } catch (error) {
      this.logger.error(`Failed to disconnect from database: ${error.message}`);
      throw error;
    }
  }
} 