import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRefreshRequest } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Gender, Role } from '../users/entities/user.enums';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate registration to the service', async () => {
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
    const tokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };
    mockAuthService.register.mockResolvedValue(tokens);

    await expect(controller.register(registerDto)).resolves.toBe(tokens);
    expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
  });

  it('should delegate login to the service', async () => {
    const loginDto: LoginDto = {
      email: 'user@example.com',
      password: 'strongPassword123',
    };
    const tokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };
    mockAuthService.login.mockResolvedValue(tokens);

    await expect(controller.login(loginDto)).resolves.toBe(tokens);
    expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
  });

  it('should delegate token refresh to the service', async () => {
    const tokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };
    mockAuthService.refreshTokens.mockResolvedValue(tokens);
    const req = {
      user: {
        sub: 'user-id',
        email: 'user@example.com',
        role: Role.USER,
      },
      refreshToken: 'current-refresh-token',
    } as AuthRefreshRequest;

    await expect(controller.refresh(req)).resolves.toBe(tokens);
    expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
      'user-id',
      'current-refresh-token',
    );
  });
});
