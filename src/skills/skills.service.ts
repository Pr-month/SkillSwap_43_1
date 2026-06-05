import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { Skill } from './entities/skill.entity';
import { GetSkillsDto } from './dto/get-skills.dto';
import { GetSkillsResponseDto } from './dto/get-skills-response.dto';

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

  async findAll(getSkillsDto: GetSkillsDto): Promise<GetSkillsResponseDto> {
    const { page = 1, limit = 10, search = '', category } = getSkillsDto;

    const queryBuilder = this.skillsRepository.createQueryBuilder('skill');

    if (search) {
      queryBuilder.andWhere(
        `
        (
          skill.title ILIKE :search
          OR skill.category ILIKE :search
        )
        `,
        {
          search: `%${search}%`,
        },
      );
    }

    if (category) {
      queryBuilder.andWhere('skill.category ILIKE :category', {
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
}
