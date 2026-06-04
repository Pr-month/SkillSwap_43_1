import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Skill } from './entities/skill.entity';
import { SkillsService } from './skills.service';

describe('SkillsService', () => {
  let service: SkillsService;
  const skillsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const usersService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: getRepositoryToken(Skill),
          useValue: skillsRepository,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should remove a skill from user favorites', async () => {
    const relationBuilder = {
      of: jest.fn().mockReturnThis(),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    const queryBuilder = {
      relation: jest.fn().mockReturnValue(relationBuilder),
    };
    skillsRepository.findOne.mockResolvedValue({ id: 'skill-id' });
    skillsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    await service.removeFromFavorites('user-id', 'skill-id');

    expect(skillsRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'skill-id' },
    });
    expect(queryBuilder.relation).toHaveBeenCalledWith(User, 'favoriteSkills');
    expect(relationBuilder.of).toHaveBeenCalledWith('user-id');
    expect(relationBuilder.remove).toHaveBeenCalledWith('skill-id');
  });

  it('should throw when skill does not exist', async () => {
    skillsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.removeFromFavorites('user-id', 'missing-skill-id'),
    ).rejects.toThrow(NotFoundException);
    expect(skillsRepository.createQueryBuilder).not.toHaveBeenCalled();
  });
});
