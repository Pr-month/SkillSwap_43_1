import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';
import { GetSkillsDto } from './dto/get-skills.dto';
import { GetSkillsResponseDto } from './dto/get-skills-response.dto';
import { Category } from 'src/categories/entities/category.entity';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly usersService: UsersService,
  ) {}

  async findById(skillId: string): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id: skillId },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  async create(
    ownerId: string,
    createSkillDto: CreateSkillDto,
  ): Promise<Skill> {
    const { categoryId, ...rest } = createSkillDto;
    const owner = await this.usersService.findById(ownerId);

    const category = await this.categoryRepository.findOneBy({
      id: categoryId,
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const skill = this.skillsRepository.create({
      ...rest,
      owner,
      category,
    });

    return this.skillsRepository.save(skill);
  }

  async update(
    currentUserId: string,
    skillId: string,
    updateSkillDto: UpdateSkillDto,
  ): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id: skillId },
      relations: { owner: true },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    if (skill.owner.id !== currentUserId) {
      throw new ForbiddenException('You can only update your own skills');
    }

    Object.assign(skill, updateSkillDto);
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

  async findAll(getSkillsDto: GetSkillsDto): Promise<GetSkillsResponseDto> {
    const { page = 1, limit = 20, search = '', category } = getSkillsDto;

    const queryBuilder = this.skillsRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.category', 'category')
      .leftJoinAndSelect('category.parent', 'parent');

    if (search) {
      queryBuilder.andWhere(
        `
            (
              skill.title ILIKE :search
              OR category.name ILIKE :search
              OR parent.name ILIKE :search
            )
          `,
        {
          search: `%${search}%`,
        },
      );
    }

    if (category) {
      queryBuilder.andWhere('category.name ILIKE :category', {
        category: `%${category}%`,
      });
    }

    const [skills, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    if (page > totalPages && total > 0) {
      throw new NotFoundException(`Страница ${page} не существует`);
    }

    return {
      data: skills,
      page,
      totalPages,
    };
  }

  async delete(userId: string, skillId: string): Promise<void> {
    const skill = await this.skillsRepository.findOne({
      where: { id: skillId },
      relations: {
        owner: true,
      },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    if (skill.owner.id !== userId) {
      throw new ForbiddenException('You can only delete your own skills');
    }
    await Promise.all(
      skill.images.map(async (image) => {
        try {
          await unlink(join(process.cwd(), 'public', 'uploads', image));
        } catch {
          // ignore error if file does not exist
        }
      }),
    );

    await this.skillsRepository.delete(skillId);
  }
}
