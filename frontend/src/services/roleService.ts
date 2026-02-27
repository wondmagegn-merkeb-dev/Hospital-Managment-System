import type { Role, Permission, UserRole, PaginatedRolesResponse, PaginatedPermissionsResponse } from '../types/role';
import type { SortDirection } from '../components/Table';
import api from './api';
import { buildPermissionsFromConfig } from '../config/permissions';

// Role CRUD operations
export const getRoles = async (): Promise<Role[]> => {
  // Use /role/all for unpaginated list (backend returns Role[] directly)
  const response = await api.get('/role/all');
  return response.data;
};

export const getRoleById = async (id: string): Promise<Role> => {
  const response = await api.get(`/role/${id}`);
  return response.data;
};

export const createRole = async (roleData: { 
  name: string; 
  description?: string | null; 
  permissions?: Record<string, string[]>;
}): Promise<Role> => {
  const response = await api.post('/role/', roleData);
  return response.data;
};

export const updateRole = async (
  id: string, 
  roleData: { 
    name?: string; 
    description?: string | null; 
    permissions?: Record<string, string[]>;
  }
): Promise<Role> => {
  const response = await api.put(`/role/${id}`, roleData);
  return response.data;
};

export const deleteRole = async (id: string): Promise<void> => {
  await api.delete(`/role/${id}`);
};

export const getRolesPaginated = async (
  page: number = 1,
  pageSize: number = 10,
  sortColumn: string | null = null,
  sortDirection: SortDirection = null,
  search: string = ''
): Promise<PaginatedRolesResponse> => {
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
  
  const response = await api.get('/role/', { params });
  return response.data;
};

// Permission operations - built from permissions.json config
const permissionsCache = buildPermissionsFromConfig();

export const getPermissions = async (): Promise<Permission[]> => {
  return Promise.resolve(permissionsCache);
};

export const getPermissionByName = (name: string): Permission | undefined => {
  return permissionsCache.find(permission => permission.name === name);
};

export const getPermissionsPaginated = async (
  page: number = 1,
  pageSize: number = 10,
  sortColumn: string | null = null,
  sortDirection: SortDirection = null,
  search: string = ''
): Promise<PaginatedPermissionsResponse> => {
  let filteredPermissions = [...permissionsCache];
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredPermissions = filteredPermissions.filter(permission => 
      permission.name.toLowerCase().includes(searchLower) ||
      (permission.description && permission.description.toLowerCase().includes(searchLower)) ||
      permission.module.toLowerCase().includes(searchLower)
    );
  }
  
  if (sortColumn && sortDirection) {
    filteredPermissions.sort((a, b) => {
      const aValue = a[sortColumn as keyof Permission] ?? '';
      const bValue = b[sortColumn as keyof Permission] ?? '';
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      return sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }
  
  const total = filteredPermissions.length;
  const startIndex = (page - 1) * pageSize;
  const data = filteredPermissions.slice(startIndex, startIndex + pageSize);
  
  return { data, total };
};

// User-Role mapping operations
export const getUserRoles = async (userId: string): Promise<UserRole[]> => {
  const response = await api.get(`/role/user/${userId}/roles`);
  return response.data;
};

export const assignRoleToUser = async (userId: string, roleId: string): Promise<UserRole> => {
  const response = await api.post(`/role/user/${userId}/role/${roleId}`);
  return response.data;
};

export const removeRoleFromUser = async (userId: string, roleId: string): Promise<void> => {
  await api.delete(`/role/user/${userId}/role/${roleId}`);
};

