import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Gender } from '../entities/user.enums';

export class PatchCurrentUserDto {
  @ApiPropertyOptional({
    description: 'Имя пользователя',
    example: 'Иван Иванов',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Краткая информация о пользователе',
    example: 'Программист с 5-летним опытом',
  })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({
    description: 'Дата рождения в формате ISO 8601',
    example: '1995-05-15T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthdate?: Date;

  @ApiPropertyOptional({
    description: 'Город проживания',
    example: 'Москва',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Пол пользователя',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Ссылка на аватар пользователя',
    example: '/uploads/avatar-uuid.png',
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}
