import { Test, TestingModule } from '@nestjs/testing';
import { AccessTokenGuard } from '../auth/accessToken.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const usersService = {
    findAll: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    })
      .overrideGuard(AccessTokenGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all users', async () => {
    const users = [{ id: 'user-id' }];
    usersService.findAll.mockResolvedValue(users);

    await expect(controller.findAll()).resolves.toBe(users);
    expect(usersService.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return the current user', async () => {
    const user = { id: 'user-id' };
    usersService.findById.mockResolvedValue(user);

    await expect(
      controller.findMe({
        user: {
          id: 'user-id',
          payload: { sub: 'user-id' },
        },
      } as never),
    ).resolves.toBe(user);
    expect(usersService.findById).toHaveBeenCalledWith('user-id');
  });
});
