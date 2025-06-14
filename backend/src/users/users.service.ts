import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: { username: string; password: string; role: UserRole }) {
    this.logger.debug(`Creating user: ${data.username}`);
    try {
      const user = await this.prisma.user.create({
        data,
      });
      this.logger.debug(`User created successfully: ${data.username}`);
      return user;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }

  async findByUsername(username: string) {
    this.logger.debug(`Finding user by username: ${username}`);
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
      });
      if (user) {
        this.logger.debug(`User found: ${username}`);
      } else {
        this.logger.debug(`User not found: ${username}`);
      }
      return user;
    } catch (error) {
      this.logger.error(`Error finding user: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string) {
    this.logger.debug(`Finding user by id: ${id}`);
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (user) {
        this.logger.debug(`User found by id: ${id}`);
      } else {
        this.logger.debug(`User not found by id: ${id}`);
      }
      return user;
    } catch (error) {
      this.logger.error(`Error finding user by id: ${error.message}`);
      throw error;
    }
  }
} 