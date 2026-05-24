import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

type DatabaseType = 'postgres' | 'mongodb'

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DataSourceOptions => ({
        type: configService.get<DatabaseType>('DATABASE_DRIVER', 'postgres'),
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        database: configService.get<string>('DATABASE_NAME', 'db'),
        username: configService.get<string>('DATABASE_USERNAME', 'db'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        entities: [],
        synchronize: false,
      })
    }),
    AuthModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
