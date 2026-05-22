import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

enum IGender {
  MALE = 'male',
  FEMALE = 'female',
}

enum IRole {
  USER = 'user',
  ADMIN = 'admin',
}

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
    type: 'datetime',
  })
  birthdate: Date;

  @Column()
  city: string;

  @Column({
    enum: IGender,
  })
  gender: IGender;

  @Column()
  avatar: string;

  @Column('simple-array')
  skills: string[];

  @Column('simple-array')
  wantToLearn: string[];

  @Column('simple-array')
  favoriteSkills: string[];

  @Column({
    enum: IRole,
  })
  role: IRole;

  @Column()
  refreshToken: string;
}
