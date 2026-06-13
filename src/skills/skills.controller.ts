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
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { User } from '../users/entities/user.entity';
import {
  ApiSkillsAddToFavorites,
  ApiSkillsCreate,
  ApiSkillsDelete,
  ApiSkillsFindAll,
  ApiSkillsRemoveFromFavorites,
  ApiSkillsUpdate,
} from './docs/skills.swagger';
import { CreateSkillDto } from './dto/create-skill.dto';
import { GetSkillsResponseDto } from './dto/get-skills-response.dto';
import { GetSkillsDto } from './dto/get-skills.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';
import { SkillsService } from './skills.service';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @ApiSkillsCreate()
  @UseGuards(AccessTokenGuard)
  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createSkillDto: CreateSkillDto,
  ): Promise<Skill> {
    return this.skillsService.create(request.user.id, createSkillDto);
  }

  @ApiSkillsUpdate()
  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id') skillId: string,
    @Body() updateSkillDto: UpdateSkillDto,
  ): Promise<Skill> {
    return this.skillsService.update(request.user.id, skillId, updateSkillDto);
  }

  @ApiSkillsAddToFavorites()
  @UseGuards(AccessTokenGuard)
  @HttpCode(204)
  @Post(':id/favorite')
  addToFavorites(
    @Req() request: AuthenticatedRequest,
    @Param('id') skillId: string,
  ): Promise<void> {
    return this.skillsService.addToFavorites(request.user.id, skillId);
  }

  @ApiSkillsRemoveFromFavorites()
  @UseGuards(AccessTokenGuard)
  @HttpCode(204)
  @Delete(':id/favorite')
  removeFromFavorites(
    @Req() request: AuthenticatedRequest,
    @Param('id') skillId: string,
  ): Promise<void> {
    return this.skillsService.removeFromFavorites(request.user.id, skillId);
  }

  @ApiSkillsFindAll()
  @Get()
  findAll(@Query() getSkillsDto: GetSkillsDto): Promise<GetSkillsResponseDto> {
    return this.skillsService.findAll(getSkillsDto);
  }

  @Get(':id/similar')
  findSimilarUsers(@Param('id') skillId: string): Promise<User[]> {
    return this.skillsService.findSimilarUsers(skillId, 10);
  }

  @ApiSkillsDelete()
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  delete(
    @Req() request: AuthenticatedRequest,
    @Param('id') skillId: string,
  ): Promise<void> {
    return this.skillsService.delete(request.user.id, skillId);
  }
}
