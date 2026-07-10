import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { Skill } from './entities/skill.entity';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill, Category, User]),
    AuthModule,
    UsersModule,
  ],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
