import { Skill } from '../entities/skill.entity';

export class GetSkillsResponseDto {
  data: Skill[];
  page: number;
  totalPages: number;
}
