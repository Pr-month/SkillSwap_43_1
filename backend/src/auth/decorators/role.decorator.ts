import { Reflector } from '@nestjs/core';
import { Role } from '../../users/entities/user.enums';

export const Roles = Reflector.createDecorator<Role[]>();
