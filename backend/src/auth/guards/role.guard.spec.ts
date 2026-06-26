import { RolesGuard } from './role.guard';
import { Role } from '../../users/entities/user.enums';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let mockContext: ExecutionContext;

  const mockRequest = (role: Role): AuthenticatedRequest =>
    ({ user: { id: 'user-id', role } }) as AuthenticatedRequest;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles are set', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);
    mockContext = {
      getHandler: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => mockRequest(Role.USER),
      }),
    } as unknown as ExecutionContext;

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(reflector.get).toHaveBeenCalled();
  });

  it('should allow access when user has the required role', () => {
    jest.spyOn(reflector, 'get').mockReturnValue([Role.ADMIN]);
    mockContext = {
      getHandler: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => mockRequest(Role.ADMIN),
      }),
    } as unknown as ExecutionContext;

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should deny access when user does not have the required role', () => {
    jest.spyOn(reflector, 'get').mockReturnValue([Role.ADMIN]);
    mockContext = {
      getHandler: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => mockRequest(Role.USER),
      }),
    } as unknown as ExecutionContext;

    const result = guard.canActivate(mockContext);

    expect(result).toBe(false);
  });
});
