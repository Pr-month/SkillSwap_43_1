import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Название категории',
    example: 'Музыкальные инструменты',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'UUID родительской категории (если это подкатегория)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}
