import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role, Gender } from './user.enums';
import { Skill } from '../../skills/entities/skill.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  about: string;

  @Column({
    type: 'timestamptz',
  })
  birthdate: Date;

  @Column()
  city: string;

  @Column({
    enum: Gender,
  })
  gender: Gender;

  @Column()
  avatar: string;

  @OneToMany(() => Skill, (skill) => skill.owner)
  skills: Skill[];

  @ManyToMany(() => Skill)
  @JoinTable({
    name: 'user_want_to_learn_skills',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skill_id', referencedColumnName: 'id' },
  })
  wantToLearn: Skill[];

  @ManyToMany(() => Skill)
  @JoinTable({
    name: 'user_favourite_skills',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skill_id', referencedColumnName: 'id' },
  })
  favoriteSkills: Skill[];

  @Column({
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column()
  refreshToken: string;
}
