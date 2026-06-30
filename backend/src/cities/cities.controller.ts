import { Controller, Get, Query } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  findAll(@Query('name') name?: string): Promise<City[]> {
    return this.citiesService.findAll(name);
  }
}
