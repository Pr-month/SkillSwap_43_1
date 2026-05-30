import {
  Column,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  category: string;

  @Column('simple-array')
  images: string[];

  @ManyToOne(() => User, (user) => user.skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ManyToMany(() => User, (user) => user.wantToLearn)
  wantToLearnBy: User[];

  @ManyToMany(() => User, (user) => user.favoriteSkills)
  favoriteBy: User[];
}
