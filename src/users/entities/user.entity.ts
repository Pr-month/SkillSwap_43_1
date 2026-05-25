import * as bcrypt from 'bcrypt';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role, Gender } from './user.enums';

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
  password: string;

  @Column()
  about: string;

  @Column({
    type: 'timestamp',
  })
  birthdate: Date;

  @Column()
  city: string;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column()
  avatar: string;

  @Column('simple-array')
  skills: string[];

  @Column('simple-array')
  wantToLearn: string[];

  @Column('simple-array')
  favoriteSkills: string[];

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column()
  refreshToken: string;

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
