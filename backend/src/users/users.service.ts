import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DeepPartial, Repository } from 'typeorm';
import { Gender } from './entities/user.enums';
import { User } from './entities/user.entity';
import { PatchCurrentUserDto } from './dto';
import { City } from '../cities/entities/city.entity';

type TCreateUserData = {
  name: string;
  email: string;
  password: string;
  about: string;
  birthdate: Date;
  city: City;
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

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async createUser(createUserData: TCreateUserData): Promise<User> {
    const user = this.usersRepository.create(
      createUserData as DeepPartial<User>,
    );

    return this.usersRepository.save(user);
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findById(userId);

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.password = newPassword;
    await this.usersRepository.save(user);
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      refreshToken,
    });
  }

  async patchCurrentUser(id: string, data: PatchCurrentUserDto): Promise<void> {
    const user = await this.findById(id);
    Object.assign(user, data);
    await this.usersRepository.save(user);
  }
}
