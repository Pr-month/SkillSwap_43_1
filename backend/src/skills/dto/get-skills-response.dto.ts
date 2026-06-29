import { ApiProperty } from '@nestjs/swagger';
import { Skill } from '../entities/skill.entity';

export class GetSkillsResponseDto {
  @ApiProperty({
    description: 'Массив навыков на текущей странице',
    type: [Skill],
  })
  data!: Skill[];

  @ApiProperty({
    description: 'Номер текущей страницы',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Общее количество страниц',
    example: 5,
  })
  totalPages!: number;
}
