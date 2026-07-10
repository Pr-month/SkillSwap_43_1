import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateSkillDto {
  @ApiPropertyOptional({
    description: 'Название навыка',
    example: 'Игра на гитаре',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({
    description: 'Описание навыка',
    example: 'Обновлённое описание навыка',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({
    description: 'Название категории',
    example: 'Музыкальные инструменты',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string;

  @ApiPropertyOptional({
    description: 'Массив публичных ссылок на изображения (минимум 1 ссылка)',
    example: ['/uploads/skill-image-1.png'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  images?: string[];
}
