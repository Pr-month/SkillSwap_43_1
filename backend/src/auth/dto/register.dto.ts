import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEmail, IsEnum, IsString } from 'class-validator';
import { Gender } from 'src/users/entities/user.enums';

export class RegisterDto {
  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван Иванов',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Email пользователя (должен быть уникальным)',
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'strongPassword123',
  })
  @IsString()
  password!: string;

  @ApiProperty({
    description: 'Краткая информация о пользователе',
    example: 'Программист с 5-летним опытом, люблю горы и кофе',
  })
  @IsString()
  about!: string;

  @ApiProperty({
    description: 'Дата рождения в формате ISO 8601',
    example: '1995-05-15T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @Type(() => Date)
  @IsDate()
  birthdate!: Date;

  @ApiProperty({
    description: 'Город проживания',
    example: 'Москва',
  })
  @IsString()
  city!: string;

  @ApiProperty({
    description: 'Пол пользователя',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  gender!: Gender;

  @ApiProperty({
    description: 'Ссылка на аватар пользователя',
    example: '/uploads/avatar-uuid.png',
  })
  @IsString()
  avatar!: string;

  @ApiProperty({
    description: 'Массив UUID навыков, которыми владеет пользователь',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  skills!: string[];

  @ApiProperty({
    description: 'Массив UUID категорий, которым пользователь хочет научиться',
    example: ['661f9511-f30c-52e5-b827-557766551111'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  wantToLearn!: string[];

  @ApiProperty({
    description: 'Массив UUID навыков, добавленных в избранное',
    example: ['772a0622-e41d-63f6-c938-668877662222'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  favoriteSkills!: string[];
}
