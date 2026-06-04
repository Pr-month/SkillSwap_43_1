import { Test, TestingModule } from '@nestjs/testing';
import { AccessTokenGuard } from '../auth/accessToken.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

describe('SkillsController', () => {
  let controller: SkillsController;
  const skillsService = {
    create: jest.fn(),
    update: jest.fn(),
    addToFavorites: jest.fn(),
    removeFromFavorites: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [
        {
          provide: SkillsService,
          useValue: skillsService,
        },
      ],
    })
      .overrideGuard(AccessTokenGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SkillsController>(SkillsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should add skill to favorites', async () => {
    const request = {
      user: { id: 'user-id' },
    } as unknown as AuthenticatedRequest;
    const skillId = 'skill-id';
    skillsService.addToFavorites.mockResolvedValue(undefined);

    await controller.addToFavorites(request, skillId);

    expect(skillsService.addToFavorites).toHaveBeenCalledWith(
      'user-id',
      'skill-id',
    );
  });

  it('should update skill', async () => {
    const request = {
      user: { id: 'user-id' },
    } as unknown as AuthenticatedRequest;
    const skillId = 'skill-id';
    const updateSkillDto = { title: 'Updated title' };
    const updatedSkill = {
      id: 'skill-id',
      title: 'Updated title',
    };
    skillsService.update.mockResolvedValue(updatedSkill);

    const result = await controller.update(request, skillId, updateSkillDto);

    expect(skillsService.update).toHaveBeenCalledWith(
      'user-id',
      'skill-id',
      updateSkillDto,
    );
    expect(result).toBe(updatedSkill);
  });

  it('should remove skill from favorites', async () => {
    const request = {
      user: { id: 'user-id' },
    } as unknown as AuthenticatedRequest;
    const skillId = 'skill-id';
    skillsService.removeFromFavorites.mockResolvedValue(undefined);

    await controller.removeFromFavorites(request, skillId);

    expect(skillsService.removeFromFavorites).toHaveBeenCalledWith(
      'user-id',
      'skill-id',
    );
  });
});
