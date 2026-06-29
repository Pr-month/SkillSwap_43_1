import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role, Gender } from './user.enums';
import { City } from '../../cities/entities/city.entity';
import { Skill } from '../../skills/entities/skill.entity';
import { Request } from '../../requests/entities/request.entity';

const PASSWORD_SALT_ROUNDS = 10;

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  about: string;

  @Column({
    type: 'timestamptz',
  })
  birthdate: Date;

  @ManyToOne(() => City, (city) => city.users)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({
    type: 'enum',
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
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ nullable: true, type: 'varchar' })
  @Exclude()
  refreshToken: string | null;

  @OneToMany(() => Request, (request) => request.sender)
  outgoingRequests: Request[];

  @OneToMany(() => Request, (request) => request.receiver)
  incomingRequests: Request[];

  @BeforeInsert()
  @BeforeUpdate()
  async encryptPassword(): Promise<void> {
    if (!this.password || this.isPasswordEncrypted()) {
      return;
    }

    this.password = await bcrypt.hash(this.password, PASSWORD_SALT_ROUNDS);
  }

  private isPasswordEncrypted(): boolean {
    return /^\$2[aby]\$\d{2}\$/.test(this.password);
  }
}
