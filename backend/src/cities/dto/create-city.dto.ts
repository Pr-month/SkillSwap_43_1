import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateCityDto {
  @ApiProperty({
    description: 'Название города',
    example: 'Москва',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Широта города',
    example: 55.7558,
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Долгота города',
    example: 37.6176,
  })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'Федеральный округ',
    example: 'Центральный',
  })
  @IsString()
  district: string;

  @ApiProperty({
    description: 'Численность населения',
    example: 13010112,
  })
  @IsNumber()
  population: number;

  @ApiProperty({
    description: 'Субъект Российской Федерации',
    example: 'Москва',
  })
  @IsString()
  subject: string;
}
