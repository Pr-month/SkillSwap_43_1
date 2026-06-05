import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../auth/accessToken.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateSkillDto } from './dto/create-skill.dto';
import { Skill } from './entities/skill.entity';
import { SkillsService } from './skills.service';
import { GetSkillsDto } from './dto/get-skills.dto';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createSkillDto: CreateSkillDto,
  ): Promise<Skill> {
    return this.skillsService.create(request.user.id, createSkillDto);
  }

  @Get()
  findAll(@Query() getSkillsDto: GetSkillsDto) {
    return this.skillsService.findAll(getSkillsDto);
  }
}
