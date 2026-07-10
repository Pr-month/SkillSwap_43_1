import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Текущий пароль пользователя',
    example: 'oldStrongPassword123',
  })
  @IsString()
  currentPassword!: string;

  @ApiProperty({
    description: 'Новый пароль пользователя (минимум 8 символов)',
    example: 'newStrongPassword456',
  })
  @IsString()
  newPassword!: string;
}
