import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateRequestDto {
  @ApiProperty({
    description: 'UUID навыка, который отправитель хочет получить',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  requestedSkill!: string;

  @ApiProperty({
    description: 'UUID навыка, который отправитель предлагает в обмен',
    example: '661f9511-f30c-52e5-b827-557766551111',
  })
  @IsUUID()
  offeredSkill!: string;
}
