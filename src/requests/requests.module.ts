import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { SkillsModule } from '../skills/skills.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request]),
    AuthModule,
    UsersModule,
    SkillsModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
