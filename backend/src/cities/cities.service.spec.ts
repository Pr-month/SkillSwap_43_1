import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ILike } from 'typeorm';
import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';

describe('CitiesService', () => {
  let service: CitiesService;

  const mockCityRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesService,
        {
          provide: getRepositoryToken(City),
          useValue: mockCityRepository,
        },
      ],
    }).compile();

    service = module.get<CitiesService>(CitiesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new city', async () => {
      const dto = {
        name: 'Москва',
        latitude: 55.7558,
        longitude: 37.6176,
        district: 'Центральный',
        population: 13010112,
        subject: 'Москва',
      };
      const saved = { id: 'city-id', ...dto };
      mockCityRepository.save.mockResolvedValue(saved);

      await expect(service.create(dto)).resolves.toBe(saved);
      expect(mockCityRepository.save).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    const id = 'city-id';
    const dto = { name: 'Новое имя' };

    it('should update a city and return the updated entity', async () => {
      const existing = { id, name: 'Старое имя' };
      const updated = { id, name: 'Новое имя' };
      mockCityRepository.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(updated);
      mockCityRepository.update.mockResolvedValue(undefined);

      await expect(service.update(id, dto as never)).resolves.toEqual(updated);
      expect(mockCityRepository.update).toHaveBeenCalledWith(id, dto);
    });

    it('should throw when the city is not found', async () => {
      mockCityRepository.findOne.mockResolvedValue(null);

      await expect(service.update(id, dto as never)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockCityRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const id = 'city-id';

    it('should delete the city', async () => {
      mockCityRepository.findOne.mockResolvedValue({ id });
      mockCityRepository.delete.mockResolvedValue(undefined);

      await expect(service.remove(id)).resolves.toBeUndefined();
      expect(mockCityRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should throw when the city is not found', async () => {
      mockCityRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockCityRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all cities when no filter is provided', async () => {
      const cities = [{ id: 'city-id', name: 'Москва' }];
      mockCityRepository.find.mockResolvedValue(cities);

      await expect(service.findAll()).resolves.toBe(cities);
      expect(mockCityRepository.find).toHaveBeenCalledWith({
        where: {},
        take: 10,
        order: { name: 'ASC' },
      });
    });

    it('should filter cities by name using ILike', async () => {
      const cities = [{ id: 'city-id', name: 'Москва' }];
      mockCityRepository.find.mockResolvedValue(cities);

      await expect(service.findAll('Моск')).resolves.toBe(cities);
      expect(mockCityRepository.find).toHaveBeenCalledWith({
        where: { name: ILike('%Моск%') },
        take: 10,
        order: { name: 'ASC' },
      });
    });
  });

  describe('findById', () => {
    it('should return the city by id', async () => {
      const city = { id: 'city-id', name: 'Москва' };
      mockCityRepository.findOne.mockResolvedValue(city);

      await expect(service.findById('city-id')).resolves.toBe(city);
      expect(mockCityRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'city-id' },
      });
    });

    it('should throw when the city is not found', async () => {
      mockCityRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('findByName', () => {
    it('should return the city by name', async () => {
      const city = { id: 'city-id', name: 'Москва' };
      mockCityRepository.findOne.mockResolvedValue(city);

      await expect(service.findByName('Москва')).resolves.toBe(city);
      expect(mockCityRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Москва' },
      });
    });

    it('should throw when the city is not found by name', async () => {
      mockCityRepository.findOne.mockResolvedValue(null);

      await expect(service.findByName('Несуществующий')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
