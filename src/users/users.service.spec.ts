import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const usersRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all users', async () => {
    const users = [{ id: 'user-id' }];
    usersRepository.find.mockResolvedValue(users);

    await expect(service.findAll()).resolves.toBe(users);
    expect(usersRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should find a user by id', async () => {
    const user = { id: 'user-id' };
    usersRepository.findOne.mockResolvedValue(user);

    await expect(service.findById('user-id')).resolves.toBe(user);
    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'user-id' },
    });
  });

  it('should throw when user is not found by id', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await expect(service.findById('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
