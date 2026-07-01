import { IsNumber, IsString } from 'class-validator';

export class CreateCityDto {
  @IsString()
  name: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  district: string;

  @IsNumber()
  population: number;

  @IsString()
  subject: string;
}
