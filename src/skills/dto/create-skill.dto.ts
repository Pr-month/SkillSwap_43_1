import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateSkillDto {
  @ApiProperty({
    description: 'Название навыка',
    example: 'Игра на гитаре',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Описание навыка',
    example:
      'Научу играть на гитаре с нуля, классические и эстрадные произведения',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'UUID категории, к которой относится навык',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({
    description:
      'Массив публичных ссылок на изображения навыка (минимум 1 ссылка)',
    example: ['/uploads/skill-image-1.png'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  images!: string[];
}
