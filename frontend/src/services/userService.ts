import type { UserFormData, UpdateUserFormData } from '../validation/user';
import type { SortDirection } from '../components/Table';
import type { User, PaginatedUsersResponse } from '../types/user';
import api from './api';

export type { User, PaginatedUsersResponse };

// Get user by ID
export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get(`/user/${id}`);
  return response.data;
};

// Create a new user (username and password optional - backend auto-generates if not provided)
export const createUser = async (userData: UserFormData): Promise<User> => {
  const payload: any = {
    email: userData.email,
    full_name: userData.full_name || null,
    status: userData.status || 'active',
  };

  if ('roleIds' in userData && userData.roleIds && userData.roleIds.length > 0) {
    payload.role_ids = userData.roleIds;
  }

  // Include username if provided
  if ('username' in userData && userData.username && userData.username.trim()) {
    payload.username = userData.username.trim();
  }

  // Include password if provided
  if ('password' in userData && userData.password && userData.password.trim()) {
    payload.password = userData.password.trim();
  }

  const response = await api.post('/user/register', payload);
  return response.data;
};

// Update an existing user
export const updateUser = async (id: string, userData: Partial<UpdateUserFormData>): Promise<User> => {
  const payload: any = {};
  
  if (userData.email !== undefined) payload.email = userData.email;
  if ('username' in userData && userData.username !== undefined) payload.username = userData.username;
  if (userData.full_name !== undefined) payload.full_name = userData.full_name;
  // Only include password if it's provided and not empty
  if (userData.password !== undefined && userData.password !== '') {
    payload.password = userData.password;
  }
  if (userData.status !== undefined) payload.status = userData.status;
      
  // Transform roleIds to role_ids for backend
  if ('roleIds' in userData && userData.roleIds !== undefined) {
    payload.role_ids = userData.roleIds;
  }
  
  const response = await api.put(`/user/${id}`, payload);
  return response.data;
};

// Delete a user
export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/user/${id}`);
};

// Get paginated users with search, sorting, and filtering
export const getUsersPaginated = async (
  page: number = 1,
  pageSize: number = 10,
  sortColumn: string | null = null,
  sortDirection: SortDirection | null = null,
  search: string = '',
  roleFilter: string = 'all'
): Promise<PaginatedUsersResponse> => {
  const params: Record<string, string> = {
    page: page.toString(),
    page_size: pageSize.toString(),
  };
  
  if (search) {
    params.search = search;
  }
  
  if (sortColumn && sortDirection) {
    params.sort_column = sortColumn;
    params.sort_direction = sortDirection;
  }
  
  if (roleFilter && roleFilter !== 'all') {
    params.role_filter = roleFilter;
  }
  
  const response = await api.get('/user/', { params });
  return response.data;
};
