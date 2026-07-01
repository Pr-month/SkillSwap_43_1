import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CitiesService } from '../cities/cities.service';

describe('UsersService', () => {
  let service: UsersService;
  const usersRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };
  const citiesService = {
    findByName: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
        {
          provide: CitiesService,
          useValue: citiesService,
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

  it('should find a user by email', async () => {
    const user = { id: 'user-id', email: 'user@example.com' };
    usersRepository.findOne.mockResolvedValue(user);

    await expect(service.findByEmail('user@example.com')).resolves.toBe(user);
    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
    });
  });

  it('should create a user', async () => {
    const createUserData = {
      name: 'User Name',
      email: 'user@example.com',
      password: 'hashed-password',
      about: 'about',
      birthdate: new Date('2000-01-01T00:00:00.000Z'),
      city: 'City',
      gender: 'male',
      avatar: '/uploads/avatar.png',
      skills: ['TypeScript'],
      wantToLearn: ['NestJS'],
      favoriteSkills: ['TypeScript'],
      refreshToken: 'refresh-token',
    };
    const createdUser = { id: 'user-id', ...createUserData };
    usersRepository.create.mockReturnValue(createdUser);
    usersRepository.save.mockResolvedValue(createdUser);

    await expect(service.createUser(createUserData as never)).resolves.toBe(
      createdUser,
    );
    expect(usersRepository.create).toHaveBeenCalledWith(createUserData);
    expect(usersRepository.save).toHaveBeenCalledWith(createdUser);
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

  it('should update a user refresh token', async () => {
    usersRepository.update.mockResolvedValue(undefined);

    await expect(
      service.updateRefreshToken('user-id', 'new-refresh-token'),
    ).resolves.toBeUndefined();
    expect(usersRepository.update).toHaveBeenCalledWith('user-id', {
      refreshToken: 'new-refresh-token',
    });
  });

  it('should patch current user data', async () => {
    const cityEntity = { id: 'city-id', name: 'New City' };
    const user = {
      id: 'user-id',
      name: 'Old Name',
      city: { id: 'old-city-id', name: 'Old City' },
    };
    const patchData = {
      name: 'New Name',
      city: 'New City',
    };
    const patchedUser = { ...user, name: 'New Name', city: cityEntity };
    usersRepository.findOne.mockResolvedValue(user);
    citiesService.findByName.mockResolvedValue(cityEntity);
    usersRepository.save.mockResolvedValue(patchedUser);

    await expect(
      service.patchCurrentUser('user-id', patchData as never),
    ).resolves.toBeUndefined();
    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'user-id' },
    });
    expect(citiesService.findByName).toHaveBeenCalledWith('New City');
    expect(usersRepository.save).toHaveBeenCalledWith(patchedUser);
  });
});
