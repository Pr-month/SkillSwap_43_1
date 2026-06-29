import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtTokenService } from '../jwt/jwt.service';
import { CitiesService } from '../cities/cities.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Gender, Role } from '../users/entities/user.enums';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    createUser: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updateRefreshToken: jest.fn(),
  };

  const mockJwtTokenService = {
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  const mockCitiesService = {
    findByName: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtTokenService,
          useValue: mockJwtTokenService,
        },
        {
          provide: CitiesService,
          useValue: mockCitiesService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      name: 'Иван Иванов',
      email: 'user@example.com',
      password: 'strongPassword123',
      about: 'about',
      birthdate: new Date('2000-01-01'),
      city: 'Москва',
      gender: Gender.MALE,
      avatar: '',
      skills: [],
      wantToLearn: [],
      favoriteSkills: [],
    };
    const city = { id: 'city-id', name: 'Москва' };
    const createdUser = {
      id: 'user-id',
      email: registerDto.email,
      role: Role.USER,
    };

    it('should register a new user and return tokens', async () => {
      mockJwtTokenService.signRefreshToken.mockResolvedValueOnce(
        'temp-refresh-token',
      );
      mockCitiesService.findByName.mockResolvedValue(city);
      mockUsersService.createUser.mockResolvedValue(createdUser);
      mockJwtTokenService.signAccessToken.mockResolvedValue('access-token');
      mockJwtTokenService.signRefreshToken.mockResolvedValueOnce(
        'refresh-token',
      );
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.register(registerDto);

      expect(mockCitiesService.findByName).toHaveBeenCalledWith(
        registerDto.city,
      );
      expect(mockUsersService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          city,
          refreshToken: 'temp-refresh-token',
        }),
      );
      expect(mockJwtTokenService.signAccessToken).toHaveBeenCalledWith({
        sub: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
      });
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        createdUser.id,
        'refresh-token',
      );
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should hash the password before creating the user', async () => {
      mockJwtTokenService.signRefreshToken.mockResolvedValue('refresh-token');
      mockCitiesService.findByName.mockResolvedValue(city);
      mockUsersService.createUser.mockResolvedValue(createdUser);
      mockJwtTokenService.signAccessToken.mockResolvedValue('access-token');

      await service.register(registerDto);

      const [createUserArg] = mockUsersService.createUser.mock.calls[0] as [
        { password: string },
      ];
      expect(createUserArg.password).not.toBe(registerDto.password);
      await expect(
        bcrypt.compare(registerDto.password, createUserArg.password),
      ).resolves.toBe(true);
    });

    it('should propagate an error when the city is not found', async () => {
      mockJwtTokenService.signRefreshToken.mockResolvedValue(
        'temp-refresh-token',
      );
      mockCitiesService.findByName.mockRejectedValue(
        new NotFoundException('City not found'),
      );

      await expect(service.register(registerDto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockUsersService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'user@example.com',
      password: 'correctPassword',
    };

    it('should login with correct credentials and return tokens', async () => {
      const hashedPassword = await bcrypt.hash(loginDto.password, 1);
      const user = {
        id: 'user-id',
        email: loginDto.email,
        password: hashedPassword,
        role: Role.USER,
      };
      mockUsersService.findByEmail.mockResolvedValue(user);
      mockJwtTokenService.signAccessToken.mockResolvedValue('access-token');
      mockJwtTokenService.signRefreshToken.mockResolvedValue('refresh-token');

      const result = await service.login(loginDto);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockJwtTokenService.signAccessToken).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        user.id,
        'refresh-token',
      );
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw when the user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(mockUsersService.updateRefreshToken).not.toHaveBeenCalled();
    });

    it('should throw when the password is invalid', async () => {
      const hashedPassword = await bcrypt.hash('anotherPassword', 1);
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-id',
        email: loginDto.email,
        password: hashedPassword,
        role: Role.USER,
      });

      await expect(service.login(loginDto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(mockJwtTokenService.signAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    const userId = 'user-id';
    const currentRefreshToken = 'current-refresh-token';

    it('should issue new tokens for a valid refresh token', async () => {
      const user = {
        id: userId,
        email: 'user@example.com',
        role: Role.USER,
        refreshToken: currentRefreshToken,
      };
      mockUsersService.findById.mockResolvedValue(user);
      mockJwtTokenService.signAccessToken.mockResolvedValue('new-access-token');
      mockJwtTokenService.signRefreshToken.mockResolvedValue(
        'new-refresh-token',
      );

      const result = await service.refreshTokens(userId, currentRefreshToken);

      expect(mockUsersService.findById).toHaveBeenCalledWith(userId);
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        userId,
        'new-refresh-token',
      );
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw when the user is not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(
        service.refreshTokens(userId, currentRefreshToken),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw when the refresh token does not match', async () => {
      mockUsersService.findById.mockResolvedValue({
        id: userId,
        refreshToken: 'different-token',
      });

      await expect(
        service.refreshTokens(userId, currentRefreshToken),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(mockJwtTokenService.signAccessToken).not.toHaveBeenCalled();
    });
  });
});
