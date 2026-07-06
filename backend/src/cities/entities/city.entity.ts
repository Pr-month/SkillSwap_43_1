import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class City {
  @ApiProperty({
    description: 'UUID города',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Широта города',
    example: 55.7558,
  })
  @Column({ type: 'float' })
  latitude: number;

  @ApiProperty({
    description: 'Долгота города',
    example: 37.6176,
  })
  @Column({ type: 'float' })
  longitude: number;

  @ApiProperty({
    description: 'Федеральный округ',
    example: 'Центральный',
  })
  @Column()
  district: string;

  @ApiProperty({
    description: 'Название города',
    example: 'Москва',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Численность населения',
    example: 13010112,
  })
  @Column()
  population: number;

  @ApiProperty({
    description: 'Субъект Российской Федерации',
    example: 'Москва',
  })
  @Column()
  subject: string;

  @OneToMany(() => User, (user) => user.city)
  users: User[];
}
