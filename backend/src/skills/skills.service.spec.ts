import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { Category } from '../categories/entities/category.entity';
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
  const categoryRepository = {
    findOneBy: jest.fn(),
  };
  const usersRepository = {
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
          provide: getRepositoryToken(Category),
          useValue: categoryRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
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

  it('should update owned skill', async () => {
    const existingSkill = {
      id: 'skill-id',
      title: 'Old title',
      owner: { id: 'owner-id' },
    };
    const savedSkill = {
      ...existingSkill,
      title: 'Updated title',
    };
    skillsRepository.findOne.mockResolvedValue(existingSkill);
    skillsRepository.save.mockResolvedValue(savedSkill);

    const result = await service.update('owner-id', 'skill-id', {
      title: 'Updated title',
    });

    expect(skillsRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'skill-id' },
      relations: { owner: true },
    });
    expect(skillsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'skill-id',
        title: 'Updated title',
      }),
    );
    expect(result).toEqual(savedSkill);
  });

  it('should throw when updating someone else skill', async () => {
    skillsRepository.findOne.mockResolvedValue({
      id: 'skill-id',
      owner: { id: 'another-user-id' },
    });

    await expect(
      service.update('current-user-id', 'skill-id', { title: 'New title' }),
    ).rejects.toThrow(ForbiddenException);
    expect(skillsRepository.save).not.toHaveBeenCalled();
  });

  it('should throw when updating missing skill', async () => {
    skillsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update('current-user-id', 'missing-skill-id', {
        title: 'New title',
      }),
    ).rejects.toThrow(NotFoundException);
    expect(skillsRepository.save).not.toHaveBeenCalled();
  });

  it('should add a skill to user favorites', async () => {
    const favoritesCheckBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
    };
    const relationBuilder = {
      of: jest.fn().mockReturnThis(),
      add: jest.fn().mockResolvedValue(undefined),
    };
    const relationQueryBuilder = {
      relation: jest.fn().mockReturnValue(relationBuilder),
    };
    skillsRepository.findOne.mockResolvedValue({ id: 'skill-id' });
    skillsRepository.createQueryBuilder
      .mockReturnValueOnce(favoritesCheckBuilder)
      .mockReturnValueOnce(relationQueryBuilder);

    await service.addToFavorites('user-id', 'skill-id');

    expect(skillsRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'skill-id' },
    });
    expect(skillsRepository.createQueryBuilder).toHaveBeenNthCalledWith(
      1,
      'skill',
    );
    expect(favoritesCheckBuilder.innerJoin).toHaveBeenCalledWith(
      'skill.favoriteBy',
      'user',
      'user.id = :userId',
      { userId: 'user-id' },
    );
    expect(favoritesCheckBuilder.where).toHaveBeenCalledWith(
      'skill.id = :skillId',
      { skillId: 'skill-id' },
    );
    expect(favoritesCheckBuilder.getCount).toHaveBeenCalled();
    expect(relationQueryBuilder.relation).toHaveBeenCalledWith(
      User,
      'favoriteSkills',
    );
    expect(relationBuilder.of).toHaveBeenCalledWith('user-id');
    expect(relationBuilder.add).toHaveBeenCalledWith('skill-id');
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

  it('should throw when adding missing skill to favorites', async () => {
    skillsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.addToFavorites('user-id', 'missing-skill-id'),
    ).rejects.toThrow(NotFoundException);
    expect(skillsRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('should throw when adding already favorited skill', async () => {
    const favoritesCheckBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(1),
    };
    skillsRepository.findOne.mockResolvedValue({ id: 'skill-id' });
    skillsRepository.createQueryBuilder.mockReturnValue(favoritesCheckBuilder);

    await expect(service.addToFavorites('user-id', 'skill-id')).rejects.toThrow(
      ConflictException,
    );
    expect(skillsRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
  });

  it('should return users with skills in the same category', async () => {
    const usersByCategoryQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest
        .fn()
        .mockResolvedValue([{ id: 'user-1' }, { id: 'user-2' }]),
    };
    skillsRepository.findOne.mockResolvedValue({
      id: 'skill-id',
      category: { id: 'category-id' },
    });
    usersRepository.createQueryBuilder.mockReturnValue(
      usersByCategoryQueryBuilder,
    );

    const result = await service.findSimilarUsers('skill-id');

    expect(skillsRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'skill-id' },
      relations: { category: true },
    });
    expect(usersRepository.createQueryBuilder).toHaveBeenCalledWith('user');
    expect(usersByCategoryQueryBuilder.innerJoin).toHaveBeenCalledWith(
      'user.skills',
      'skill',
    );
    expect(usersByCategoryQueryBuilder.where).toHaveBeenCalledWith(
      'skill.categoryId = :categoryId',
      {
        categoryId: 'category-id',
      },
    );
    expect(usersByCategoryQueryBuilder.distinct).toHaveBeenCalledWith(true);
    expect(usersByCategoryQueryBuilder.take).toHaveBeenCalledWith(10);
    expect(result).toEqual([{ id: 'user-1' }, { id: 'user-2' }]);
  });

  it('should throw when searching similar users for missing skill', async () => {
    skillsRepository.findOne.mockResolvedValue(null);

    await expect(service.findSimilarUsers('missing-skill-id')).rejects.toThrow(
      NotFoundException,
    );
    expect(usersRepository.createQueryBuilder).not.toHaveBeenCalled();
  });
});
