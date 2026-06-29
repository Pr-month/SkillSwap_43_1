import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float' })
  latitude: number;

  @Column({ type: 'float' })
  longitude: number;

  @Column()
  district: string;

  @Column()
  name: string;

  @Column()
  population: number;

  @Column()
  subject: string;

  @OneToMany(() => User, (user) => user.city)
  users: User[];
}
