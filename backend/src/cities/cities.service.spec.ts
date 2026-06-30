import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';

describe('CitiesService', () => {
  let service: CitiesService;

  const mockCityRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const cities = [
      { id: '1', name: 'Москва' },
      { id: '2', name: 'Мурманск' },
    ] as City[];

    it('should return all cities limited to 10', async () => {
      mockCityRepository.find.mockResolvedValue(cities);

      const result = await service.findAll();

      expect(mockCityRepository.find).toHaveBeenCalledWith({
        where: {},
        take: 10,
        order: { name: 'ASC' },
      });
      expect(result).toEqual(cities);
    });

    it('should search cities by name with ILIKE', async () => {
      mockCityRepository.find.mockResolvedValue([cities[0]]);

      const result = await service.findAll('Моск');

      expect(mockCityRepository.find).toHaveBeenCalledWith({
        where: { name: expect.objectContaining({ _type: 'ilike', _value: '%Моск%' }) },
        take: 10,
        order: { name: 'ASC' },
      });
      expect(result).toEqual([cities[0]]);
    });

    it('should return empty array when no cities match', async () => {
      mockCityRepository.find.mockResolvedValue([]);

      const result = await service.findAll('Несуществующий город');

      expect(result).toEqual([]);
    });
  });

  describe('findByName', () => {
    it('should return a city when found', async () => {
      const city = { id: '1', name: 'Москва' } as City;
      mockCityRepository.findOne.mockResolvedValue(city);

      const result = await service.findByName('Москва');

      expect(mockCityRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Москва' },
      });
      expect(result).toEqual(city);
    });

    it('should throw NotFoundException when city not found', async () => {
      mockCityRepository.findOne.mockResolvedValue(null);

      await expect(service.findByName('НетТакогоГорода')).rejects.toThrow(
        'City with name НетТакогоГорода is not found in the database!',
      );
    });
  });
});
