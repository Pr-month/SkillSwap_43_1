import { CustomSkill } from '@/entities/skill/model/types';
import { User } from '@/entities/user/model/types';
import { getCookie, setCookie } from './cookies';

const API_BASE_URL = import.meta.env.VITE_SKILLSWAP_API_URL || '';
const URL = API_BASE_URL ? `${API_BASE_URL}` : '';

export const checkResponse = <T>(res: Response): Promise<T> =>
  res.ok ? res.json() : res.json().then(err => Promise.reject(err));

export type TServerResponse<T> = {
  success: boolean;
} & T;

export type TRefreshResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
}>;

export type TAuthResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
  user: User;
}>;

export type TUserResponse = TServerResponse<{ user: User }>;

export type TLoginData = {
  email: string;
  password: string;
};

type BackendCity = {
  name?: string;
};

type BackendSkill = {
  id: string;
  title: string;
  description: string;
  images?: string[];
  category?: {
    id: string;
    name: string;
    parent?: {
      id: string;
      name: string;
    } | null;
  };
};

export type BackendUser = {
  id: string;
  name: string;
  email?: string;
  about?: string;
  birthdate?: string;
  city?: BackendCity | string;
  gender?: string;
  avatar?: string;
  skills?: BackendSkill[];
  wantToLearn?: BackendSkill[];
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const getAuthHeaders = (token?: string) => ({
  authorization: `Bearer ${token || getCookie('accessToken') || ''}`,
});

const mapSkill = (skill?: BackendSkill): CustomSkill => {
  const category = skill?.category;

  return {
    category: (category?.parent?.name || category?.name || '') as CustomSkill['category'],
    subcategory: (category?.name || '') as CustomSkill['subcategory'],
    subcategoryId: category?.id || skill?.id || '',
    name: skill?.title || '',
    image: skill?.images || [],
    description: skill?.description || '',
    customSkillId: skill?.id || '',
  };
};

export const mapBackendUser = (user: BackendUser): User => ({
  _id: user.id,
  name: user.name,
  email: user.email,
  image: user.avatar || '',
  city: typeof user.city === 'string' ? user.city : user.city?.name || '',
  gender: user.gender === 'female' ? 'female' : user.gender === 'male' ? 'male' : 'any',
  birthdayDate: user.birthdate || '',
  description: user.about || '',
  likes: [],
  createdAt: user.birthdate || new Date().toISOString(),
  canTeach: mapSkill(user.skills?.[0]),
  wantsToLearn: (user.wantToLearn || []).map(skill => {
    const mappedSkill = mapSkill(skill);
    return {
      category: mappedSkill.category,
      subcategory: mappedSkill.subcategory,
      subcategoryId: mappedSkill.subcategoryId,
      name: mappedSkill.name,
      customSkillId: mappedSkill.customSkillId,
    };
  }),
});

export const refreshToken = (): Promise<TRefreshResponse> =>
  fetch(`${URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      ...getAuthHeaders(localStorage.getItem('refreshToken') || undefined),
    },
  })
    .then(res => checkResponse<AuthTokens>(res))
    .then(refreshData => {
      localStorage.setItem('refreshToken', refreshData.refreshToken);
      setCookie('accessToken', refreshData.accessToken);

      return {
        success: true,
        ...refreshData,
      };
    });

export const fetchWithRefresh = async <T>(url: RequestInfo, options: RequestInit) => {
  try {
    const res = await fetch(url, options);
    return await checkResponse<T>(res);
  } catch (err) {
    const error = err as { message?: string | string[]; statusCode?: number };
    const isExpired =
      error.statusCode === 401 ||
      error.message === 'jwt expired' ||
      (Array.isArray(error.message) && error.message.includes('jwt expired'));

    if (!isExpired) {
      return Promise.reject(err);
    }

    const refreshData = await refreshToken();

    if (options.headers) {
      (options.headers as { [key: string]: string }).authorization =
        `Bearer ${refreshData.accessToken}`;
    }

    const res = await fetch(url, options);
    return checkResponse<T>(res);
  }
};

export const getUserApi = () =>
  fetchWithRefresh<BackendUser>(`${URL}/api/users/me`, {
    headers: getAuthHeaders() as HeadersInit,
  }).then(user => ({
    success: true,
    user: mapBackendUser(user),
  }));

export const logoutApi = async (): Promise<TServerResponse<object>> => {
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('currentUser');

  return { success: true };
};

export const loginUserApi = (data: TLoginData) =>
  fetch(`${URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(data),
  })
    .then(res => checkResponse<AuthTokens>(res))
    .then(async tokens => {
      localStorage.setItem('refreshToken', tokens.refreshToken);
      setCookie('accessToken', tokens.accessToken);

      const userData = await getUserApi();

      return {
        success: true,
        ...tokens,
        user: userData.user,
      };
    });
