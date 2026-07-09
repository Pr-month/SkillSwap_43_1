import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, ValidateIf } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({
    description: 'Email получателя',
    example: 'user@example.com',
  })
  @IsEmail()
  to!: string;

  @ApiProperty({
    description: 'Тема письма',
    example: 'Добро пожаловать в SkillSwap!',
  })
  @IsString()
  @MinLength(1)
  subject!: string;

  @ApiPropertyOptional({
    description:
      'Текстовое содержимое письма (обязательно, если не указан html)',
    example: 'Привет! Ваш аккаунт успешно создан.',
  })
  @ValidateIf((o: SendEmailDto) => !o.html)
  @IsString()
  @MinLength(1)
  text?: string;

  @ApiPropertyOptional({
    description: 'HTML-содержимое письма (обязательно, если не указан text)',
    example: '<h1>Привет!</h1><p>Ваш аккаунт успешно создан.</p>',
  })
  @ValidateIf((o: SendEmailDto) => !o.text)
  @IsString()
  @MinLength(1)
  html?: string;
}
