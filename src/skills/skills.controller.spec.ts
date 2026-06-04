import { Test, TestingModule } from '@nestjs/testing';
import { AccessTokenGuard } from '../auth/accessToken.guard';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

describe('SkillsController', () => {
  let controller: SkillsController;
  const skillsService = {
    create: jest.fn(),
    removeFromFavorites: jest.fn(),
  };

  beforeEach(async () => {
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

  it('should remove skill from favorites', async () => {
    const request = { user: { id: 'user-id' } } as any;
    const skillId = 'skill-id';
    skillsService.removeFromFavorites.mockResolvedValue(undefined);

    await controller.removeFromFavorites(request, skillId);

    expect(skillsService.removeFromFavorites).toHaveBeenCalledWith(
      'user-id',
      'skill-id',
    );
  });
});
