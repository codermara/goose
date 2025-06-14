import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RoundsModule } from './rounds/rounds.module';
import { TapsModule } from './taps/taps.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    RoundsModule,
    TapsModule,
  ],
})
export class AppModule {} 