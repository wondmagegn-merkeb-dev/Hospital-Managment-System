import api from './api';

/** Permissions from backend: { resource: [actions] } e.g. { "user": ["read", "create"], "patient": ["read"] } */
export type UserPermissions = Record<string, string[]>;

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  status: string;
  roles: Array<{ id: string; name: string }>;
  permissions?: UserPermissions;
  is_verified?: boolean;
  is_first_login?: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface ProfileUpdateData {
  full_name?: string | null;
  current_password?: string;
  new_password?: string;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { username, password });
  return response.data;
};

export const getMe = async (): Promise<AuthUser> => {
  const response = await api.get<AuthUser>('/auth/me');
  return response.data;
};

export const updateProfile = async (data: ProfileUpdateData): Promise<AuthUser> => {
  const response = await api.put<AuthUser>('/auth/profile', data);
  return response.data;
};
