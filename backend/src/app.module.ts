import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import databaseConfig, { TDbConfig } from './config/database.config';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import appConfig from './config/app.config';
import { jwtConfig } from './config/jwt.config';
import { mailerConfig } from './config/mailer.config';
import { MailModule } from './mail/mail.module';
import { SkillsModule } from './skills/skills.module';
import { CategoriesModule } from './categories/categories.module';
import { FilesModule } from './files/files.module';
import { RequestsModule } from './requests/requests.module';
import { CitiesModule } from './cities/cities.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, jwtConfig, mailerConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [databaseConfig.KEY],
      useFactory: (dbConfig: TDbConfig) => dbConfig,
    }),
    AuthModule,
    UsersModule,
    SkillsModule,
    CategoriesModule,
    FilesModule,
    RequestsModule,
    CitiesModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
