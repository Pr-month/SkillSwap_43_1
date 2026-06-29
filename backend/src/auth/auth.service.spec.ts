import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtTokenService } from '../jwt/jwt.service';
import { CitiesService } from '../cities/cities.service';

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
