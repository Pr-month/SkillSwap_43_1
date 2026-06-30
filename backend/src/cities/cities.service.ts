import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { City } from './entities/city.entity';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async findAll(name?: string): Promise<City[]> {
    const where = name ? { name: ILike(`%${name}%`) } : {};
    return this.cityRepository.find({
      where,
      take: 10,
      order: { name: 'ASC' },
    });
  }

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
