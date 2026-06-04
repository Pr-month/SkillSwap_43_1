import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { Skill } from './entities/skill.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    ownerId: string,
    createSkillDto: CreateSkillDto,
  ): Promise<Skill> {
    const owner = await this.usersService.findById(ownerId);

    const skill = this.skillsRepository.create({
      ...createSkillDto,
      owner,
    });

    return this.skillsRepository.save(skill);
  }

  async removeFromFavorites(userId: string, skillId: string): Promise<void> {
    const skill = await this.skillsRepository.findOne({
      where: { id: skillId },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    await this.skillsRepository
      .createQueryBuilder()
      .relation(User, 'favoriteSkills')
      .of(userId)
      .remove(skillId);
  }

  async addToFavorites(userId: string, skillId: string): Promise<void> {
    const skill = await this.skillsRepository.findOne({
      where: { id: skillId },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    const alreadyInFavorites = await this.skillsRepository
      .createQueryBuilder('skill')
      .innerJoin('skill.favoriteBy', 'user', 'user.id = :userId', { userId })
      .where('skill.id = :skillId', { skillId })
      .getCount();

    if (alreadyInFavorites > 0) {
      throw new ConflictException('Skill is already in favorites');
    }

    await this.skillsRepository
      .createQueryBuilder()
      .relation(User, 'favoriteSkills')
      .of(userId)
      .add(skillId);
  }
}
