import {
  Column,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';
import { Request } from '../../requests/entities/request.entity';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => Category, (category) => category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column('simple-array')
  images: string[];

  @ManyToOne(() => User, (user) => user.skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ManyToMany(() => User, (user) => user.wantToLearn)
  wantToLearnBy: User[];

  @ManyToMany(() => User, (user) => user.favoriteSkills)
  favoriteBy: User[];

  @OneToMany(() => Request, (request) => request.offeredSkill)
  offeredRequests: Request[];

  @OneToMany(() => Request, (request) => request.requestedSkill)
  requestedRequests: Request[];
}
