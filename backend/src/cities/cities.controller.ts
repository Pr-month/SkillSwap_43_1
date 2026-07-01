import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/role.decorator';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Role } from '../users/entities/user.enums';
import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  findAll(@Query('name') name?: string): Promise<City[]> {
    return this.citiesService.findAll(name);
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles([Role.ADMIN])
  create(@Body() dto: CreateCityDto): Promise<City> {
    return this.citiesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles([Role.ADMIN])
  update(@Param('id') id: string, @Body() dto: UpdateCityDto): Promise<City> {
    return this.citiesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles([Role.ADMIN])
  remove(@Param('id') id: string): Promise<void> {
    return this.citiesService.remove(id);
  }
}
