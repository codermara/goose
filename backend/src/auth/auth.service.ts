import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    this.logger.debug(`Attempting to validate user: ${username}`);
    const user = await this.usersService.findByUsername(username);
    
    if (!user) {
      this.logger.debug(`User not found: ${username}`);
      return null;
    }

    this.logger.debug(`Found user: ${username}, comparing passwords`);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.debug(`Invalid password for user: ${username}`);
      return null;
    }

    this.logger.debug(`User validated successfully: ${username}`);
    const { password: _, ...result } = user;
    return result;
  }

  async login(username: string, password: string) {
    this.logger.debug(`Login attempt for user: ${username}`);
    let user = await this.validateUser(username, password);
    
    if (!user) {
      // Проверка существования пользователя
      this.logger.debug(`User not found, creating new user: ${username}`);
      const hashedPassword = await bcrypt.hash(password, 10);
      let role: UserRole = UserRole.SURVIVOR;
      if (username.toLowerCase() === 'admin') {
        role = UserRole.ADMIN;
      } else if (username.toLowerCase() === 'nikita') {
        role = UserRole.NIKITA;
      }

      try {
        user = await this.usersService.create({
          username,
          password: hashedPassword,
          role,
        });
        this.logger.debug(`New user created successfully: ${username}`);
        const { password: _, ...result } = user;
        user = result;
      } catch (error) {
        this.logger.error(`Error creating user: ${error.message}`);
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    const payload = { username: user.username, sub: user.id, role: user.role };
    this.logger.debug(`Login successful for user: ${username}`);
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(username: string, password: string) {
    this.logger.debug(`Registration attempt for user: ${username}`);
    
    // Проверяем, существует ли пользователь
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      this.logger.debug(`User already exists: ${username}`);
      throw new UnauthorizedException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    this.logger.debug(`Password hashed for user: ${username}`);
    
    let role: UserRole = UserRole.SURVIVOR;
    if (username.toLowerCase() === 'admin') {
      role = UserRole.ADMIN;
    } else if (username.toLowerCase() === 'nikita') {
      role = UserRole.NIKITA;
    }

    try {
      const user = await this.usersService.create({
        username,
        password: hashedPassword,
        role,
      });

      this.logger.debug(`User registered successfully: ${username}`);
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(`Error registering user: ${error.message}`);
      throw error;
    }
  }
} 