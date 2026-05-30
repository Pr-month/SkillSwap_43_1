import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEmail, IsEnum, IsString } from 'class-validator';
import { Gender } from 'src/users/entities/user.enums';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  about: string;

  @Type(() => Date)
  @IsDate()
  birthdate: Date;

  @IsString()
  city: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  avatar: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsArray()
  @IsString({ each: true })
  wantToLearn: string[];

  @IsArray()
  @IsString({ each: true })
  favoriteSkills: string[];
}
