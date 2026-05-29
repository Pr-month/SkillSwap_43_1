import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gender } from './entities/user.enums';
import { User } from './entities/user.entity';

type TCreateUserData = {
  name: string;
  email: string;
  password: string;
  about: string;
  birthdate: Date;
  city: string;
  gender: Gender;
  avatar: string;
  skills: string[];
  wantToLearn: string[];
  favoriteSkills: string[];
  refreshToken: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async createUser(createUserData: TCreateUserData): Promise<User> {
    const user = this.usersRepository.create(createUserData);

    return this.usersRepository.save(user);
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      refreshToken,
    });
  }
}
