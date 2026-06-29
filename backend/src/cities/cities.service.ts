import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async findByName(name: string): Promise<City | null> {
    const reqCity = await this.cityRepository.findOne({
      where: { name },
    });
    if (!reqCity) {
      throw new NotFoundException(
        `City with name ${name} is not found in the database!`,
      );
    }
    return reqCity;
  }
}
