import { Skill } from '@/entities/skill/model/types';
import { User } from '@/entities/user/model/types';
import { BackendUser, mapBackendUser, TServerResponse } from '@/shared/utils/api';
import { getCookie } from '@/shared/utils/cookies';

const API_BASE_URL = import.meta.env.VITE_SKILLSWAP_API_URL || '';
const URL = API_BASE_URL ? `${API_BASE_URL}` : '';

const checkResponse = <T>(res: Response): Promise<T> =>
  res.ok ? res.json() : res.json().then(err => Promise.reject(err));

type BackendCategory = {
  id: string;
  name: string;
  parent?: BackendCategory | null;
};

type BackendSkill = {
  id: string;
  title: string;
  description: string;
  images?: string[];
  category: BackendCategory;
};

type SkillsResponse = {
  data: BackendSkill[];
  page: number;
  totalPages: number;
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

const mapBackendSkill = (skill: BackendSkill): Skill =>
  ({
    category: skill.category.parent?.name || skill.category.name,
    subcategory: skill.category.name,
    subcategoryId: skill.category.id,
  }) as Skill;

export const getSkillsApi = async () => {
  const res = await fetch(`${URL}/api/skills`);
  const checkedRes = await checkResponse<SkillsResponse>(res);
  return checkedRes.data.map(mapBackendSkill);
};

export const getUsersApi = async () => {
  const res = await fetch(`${URL}/api/users`);
  const users = await checkResponse<BackendUser[]>(res);
  return users.map(mapBackendUser);
};

export type LoginData = {
  email: string;
  password: string;
};

export const loginUserApi = async (data: LoginData) => {
  const res = await fetch(`${URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(data),
  });
  return checkResponse<AuthResponse>(res);
};

export type TUpdateProfileData = {
  name: string;
  birthdate: string;
  gender: 'male' | 'female';
  city: string;
  description: string;
  avatar?: string;
};

export type TUpdateProfileResponse = TServerResponse<{
  user: User;
}>;

export const updateProfileApi = (data: TUpdateProfileData): Promise<TUpdateProfileResponse> => {
  return fetch(`${URL}/api/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: `Bearer ${getCookie('accessToken') || ''}`,
    },
    body: JSON.stringify({
      name: data.name,
      birthdate: data.birthdate,
      gender: data.gender,
      city: data.city,
      about: data.description,
      avatar: data.avatar,
    }),
  }).then(async res => {
    if (res.status === 204) {
      return { success: true, user: {} as User };
    }

    return checkResponse<TUpdateProfileResponse>(res);
  });
};

export type ServerResponse<T> = {
  success: boolean;
  data: T;
};
