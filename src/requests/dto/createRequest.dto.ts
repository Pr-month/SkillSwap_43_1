import { IsUUID } from 'class-validator';

export class CreateRequestDto {
  @IsUUID()
  requestedSkill: string;

  @IsUUID()
  offeredSkill: string;
}
