const mockAuthGuard = jest.fn((strategy: string) => {
  class MockPassportAuthGuard {
    public readonly strategy = strategy;
  }

  return MockPassportAuthGuard;
});

jest.mock('@nestjs/passport', () => ({
  AuthGuard: mockAuthGuard,
}));

import { AccessTokenGuard } from './accessToken.guard';

describe('AccessTokenGuard', () => {
  it('should be defined', () => {
    expect(AccessTokenGuard).toBeDefined();
  });

  it('should register the access-token strategy', () => {
    expect(mockAuthGuard).toHaveBeenCalledWith('access-token');
  });

  it('should create an instance of the passport auth guard class', () => {
    const guard = new AccessTokenGuard();
    const BaseGuard = mockAuthGuard.mock.results[0].value as new () => object;

    expect(guard).toBeInstanceOf(BaseGuard);
  });
});
