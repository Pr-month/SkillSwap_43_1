import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';
import { SkillsService } from './skills.service';
import { GetSkillsDto } from './dto/get-skills.dto';
import { GetSkillsResponseDto } from './dto/get-skills-response.dto';

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

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id') skillId: string,
    @Body() updateSkillDto: UpdateSkillDto,
  ): Promise<Skill> {
    return this.skillsService.update(request.user.id, skillId, updateSkillDto);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(204)
  @Post(':id/favorite')
  addToFavorites(
    @Req() request: AuthenticatedRequest,
    @Param('id') skillId: string,
  ): Promise<void> {
    return this.skillsService.addToFavorites(request.user.id, skillId);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(204)
  @Delete(':id/favorite')
  removeFromFavorites(
    @Req() request: AuthenticatedRequest,
    @Param('id') skillId: string,
  ): Promise<void> {
    return this.skillsService.removeFromFavorites(request.user.id, skillId);
  }

  @Get()
  findAll(@Query() getSkillsDto: GetSkillsDto): Promise<GetSkillsResponseDto> {
    return this.skillsService.findAll(getSkillsDto);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  delete(
    @Req() request: AuthenticatedRequest,
    @Param('id') skillId: string,
  ): Promise<void> {
    return this.skillsService.delete(request.user.id, skillId);
  }
}
