import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ListingsModule } from './modules/listings/listings.module';
import { AuctionsModule } from './modules/auctions/auctions.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { EscrowModule } from './modules/escrow/escrow.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthModule } from './modules/health/health.module';

import { DatabaseConfig } from './config/database.config';
import { AppConfig } from './config/app.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfig, DatabaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useFactory: (databaseConfig: DatabaseConfig) => ({
        type: 'postgres',
        host: databaseConfig.host,
        port: databaseConfig.port,
        username: databaseConfig.username,
        password: databaseConfig.password,
        database: databaseConfig.database,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: databaseConfig.synchronize, // false in production
        logging: databaseConfig.logging,
        ssl: databaseConfig.ssl,
      }),
      inject: [DatabaseConfig],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Health checks
    TerminusModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ListingsModule,
    AuctionsModule,
    TransactionsModule,
    EscrowModule,
    MediaModule,
    NotificationsModule,
    HealthModule,
  ],
})
export class AppModule {}
