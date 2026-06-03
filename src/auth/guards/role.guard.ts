import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/role.decorator';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { Role } from '../../users/entities/user.enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private matchRoles(allowedRoles: Role[], receivedRole: Role): boolean {
    return allowedRoles.includes(receivedRole);
  }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) return true;

    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const user = request.user;
    return this.matchRoles(roles, user.role);
  }
}
