import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const usersRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
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

  it('should exclude password and refresh token from serialized user data', () => {
    const user = Object.assign(new User(), {
      id: 'user-id',
      email: 'user@example.com',
      password: 'hashed-password',
      refreshToken: 'refresh-token',
    });

    expect(instanceToPlain(user)).toEqual({
      id: 'user-id',
      email: 'user@example.com',
    });
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

  it('should update a user password', async () => {
    const user = {
      id: 'user-id',
      password: await bcrypt.hash('old-password', 1),
    };
    usersRepository.findOne.mockResolvedValue(user);
    usersRepository.save.mockResolvedValue({
      ...user,
      password: 'new-password',
    });

    await expect(
      service.updatePassword('user-id', 'old-password', 'new-password'),
    ).resolves.toBeUndefined();
    expect(usersRepository.save).toHaveBeenCalledWith({
      ...user,
      password: 'new-password',
    });
  });

  it('should throw when the current password is invalid', async () => {
    const user = {
      id: 'user-id',
      password: await bcrypt.hash('old-password', 1),
    };
    usersRepository.findOne.mockResolvedValue(user);

    await expect(
      service.updatePassword('user-id', 'wrong-password', 'new-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(usersRepository.save).not.toHaveBeenCalled();
  });
});
