import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { City } from './entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async create(dto: CreateCityDto): Promise<City> {
    return this.cityRepository.save(dto);
  }

  async update(id: string, dto: UpdateCityDto): Promise<City> {
    const city = await this.cityRepository.findOne({ where: { id } });
    if (!city) {
      throw new NotFoundException(
        `City with id ${id} is not found in the database!`,
      );
    }
    await this.cityRepository.update(id, dto);
    return this.cityRepository.findOne({ where: { id } }) as Promise<City>;
  }

  async remove(id: string): Promise<void> {
    const city = await this.cityRepository.findOne({ where: { id } });
    if (!city) {
      throw new NotFoundException(
        `City with id ${id} is not found in the database!`,
      );
    }
    await this.cityRepository.delete(id);
  }

  async findAll(name?: string): Promise<City[]> {
    const where = name ? { name: ILike(`%${name}%`) } : {};
    return this.cityRepository.find({
      where,
      take: 10,
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<City> {
    const city = await this.cityRepository.findOne({ where: { id } });
    if (!city) {
      throw new NotFoundException(
        `City with id ${id} is not found in the database!`,
      );
    }
    return city;
  }

  async findByName(name: string): Promise<City> {
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
