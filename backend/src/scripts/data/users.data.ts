import 'dotenv/config';
import { Role, Gender } from '../../users/entities/user.enums';

export const ADMIN_DATA = {
  name: 'Admin',
  email: process.env.ADMIN_EMAIL || 'admin@skillswap.com',
  password: process.env.ADMIN_PASSWORD || 'Admin1234!',
  about: 'Platform administrator',
  birthdate: new Date('1990-01-01'),
  city: 'Moscow',
  gender: Gender.MALE,
  avatar: '',
  role: Role.ADMIN,
  refreshToken: null,
};

export const USERS_DATA = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Alice1234!',
    about: 'Frontend developer who loves React',
    birthdate: new Date('1995-03-15'),
    city: 'Saint Petersburg',
    gender: Gender.FEMALE,
    avatar: '',
    role: Role.USER,
    refreshToken: null,
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'Bob1234!',
    about: 'Backend developer, Python enthusiast',
    birthdate: new Date('1992-07-22'),
    city: 'Kazan',
    gender: Gender.MALE,
    avatar: '',
    role: Role.USER,
    refreshToken: null,
  },
];
