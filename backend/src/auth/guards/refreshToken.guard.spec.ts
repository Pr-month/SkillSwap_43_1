const mockAuthGuard = jest.fn((strategy: string) => {
  class MockPassportAuthGuard {
    public readonly strategy = strategy;
  }

  return MockPassportAuthGuard;
});

jest.mock('@nestjs/passport', () => ({
  AuthGuard: mockAuthGuard,
}));

import { RefreshTokenGuard } from './refreshToken.guard';

describe('RefreshTokenGuard', () => {
  it('should be defined', () => {
    expect(RefreshTokenGuard).toBeDefined();
  });

  it('should register the refresh-token strategy', () => {
    expect(mockAuthGuard).toHaveBeenCalledWith('refresh-token');
  });

  it('should create an instance of the passport auth guard class', () => {
    const guard = new RefreshTokenGuard();
    const BaseGuard = mockAuthGuard.mock.results[0].value as new () => object;

    expect(guard).toBeInstanceOf(BaseGuard);
  });
});
