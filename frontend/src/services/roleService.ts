import type { Role, Permission, UserRole, RolePermission, PaginatedRolesResponse, PaginatedPermissionsResponse } from '../types/role';
import type { SortDirection } from '../components/Table';
import api from './api';

// Role CRUD operations
export const getRoles = async (): Promise<Role[]> => {

  const response = await api.get('/role');
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

// Permission CRUD operations (keeping mock for now as backend may not have this yet)
const mockPermissions: Permission[] = [
  // User Management Module
  { id: 1, name: 'create_user', description: 'Create new users', module: 'User Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 2, name: 'update_user', description: 'Update existing users', module: 'User Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 3, name: 'delete_user', description: 'Delete users', module: 'User Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 4, name: 'view_user', description: 'View user details', module: 'User Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 11, name: 'create_role', description: 'Create new roles', module: 'User Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 12, name: 'update_role', description: 'Update existing roles', module: 'User Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 13, name: 'delete_role', description: 'Delete roles', module: 'User Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 14, name: 'view_role', description: 'View role details', module: 'User Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 15, name: 'assign_permission', description: 'Assign permissions to roles', module: 'User Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  // Patient Management Module
  { id: 5, name: 'create_patient', description: 'Create new patients', module: 'Patient Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 6, name: 'update_patient', description: 'Update patient records', module: 'Patient Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 7, name: 'view_patient', description: 'View patient records', module: 'Patient Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 16, name: 'delete_patient', description: 'Delete patients', module: 'Patient Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  // Appointment Management Module
  { id: 8, name: 'create_appointment', description: 'Create appointments', module: 'Appointment Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 9, name: 'update_appointment', description: 'Update appointments', module: 'Appointment Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 10, name: 'delete_appointment', description: 'Delete appointments', module: 'Appointment Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 17, name: 'view_appointment', description: 'View appointments', module: 'Appointment Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  // Pharmacy Management Module
  { id: 18, name: 'create_medicine', description: 'Create new medicines', module: 'Pharmacy Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 19, name: 'update_medicine', description: 'Update medicines', module: 'Pharmacy Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 20, name: 'view_medicine', description: 'View medicines', module: 'Pharmacy Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 21, name: 'delete_medicine', description: 'Delete medicines', module: 'Pharmacy Management', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
];

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export const getPermissions = async (): Promise<Permission[]> => {
  await delay(300);
  return mockPermissions.filter(permission => permission.deleted_at === null);
};

export const getPermissionById = async (id: number): Promise<Permission | undefined> => {
  await delay(300);
  return mockPermissions.find(permission => permission.id === id && permission.deleted_at === null);
};

export const createPermission = async (permissionData: { name: string; description?: string | null; module: string }): Promise<Permission> => {
  await delay(500);
  const now = new Date().toISOString();
  const newPermission: Permission = {
    id: mockPermissions.length + 1,
    name: permissionData.name,
    description: permissionData.description || null,
    module: permissionData.module,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };
  mockPermissions.push(newPermission);
  return newPermission;
};

export const updatePermission = async (id: number, permissionData: { name?: string; description?: string | null; module?: string }): Promise<Permission> => {
  await delay(500);
  const index = mockPermissions.findIndex(permission => permission.id === id);
  if (index !== -1) {
    mockPermissions[index] = {
      ...mockPermissions[index],
      ...permissionData,
      updated_at: new Date().toISOString(),
    };
    return mockPermissions[index];
  }
  throw new Error('Permission not found');
};

export const deletePermission = async (id: number): Promise<void> => {
  await delay(500);
  const index = mockPermissions.findIndex(permission => permission.id === id);
  if (index !== -1) {
    mockPermissions[index].deleted_at = new Date().toISOString();
    return;
  }
  throw new Error('Permission not found');
};

export const getPermissionsPaginated = async (
  page: number = 1,
  pageSize: number = 10,
  sortColumn: string | null = null,
  sortDirection: SortDirection = null,
  search: string = ''
): Promise<PaginatedPermissionsResponse> => {
  await delay(500);
  
  let filteredPermissions = mockPermissions.filter(permission => permission.deleted_at === null);
  
  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredPermissions = filteredPermissions.filter(permission => 
      permission.name.toLowerCase().includes(searchLower) ||
      (permission.description && permission.description.toLowerCase().includes(searchLower))
    );
  }
  
  // Apply sorting
  if (sortColumn && sortDirection) {
    filteredPermissions.sort((a, b) => {
      let aValue: string | number | null = a[sortColumn as keyof Permission] as string | number | null;
      let bValue: string | number | null = b[sortColumn as keyof Permission] as string | number | null;
      
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';
      
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr > bStr ? 1 : aStr < bStr ? -1 : 0;
      } else {
        return aStr < bStr ? 1 : aStr > bStr ? -1 : 0;
      }
    });
  }
  
  // Apply pagination
  const total = filteredPermissions.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPermissions = filteredPermissions.slice(startIndex, endIndex);
  
  return {
    data: paginatedPermissions,
    total: total,
  };
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

// Role-Permission mapping operations (keeping mock for now)
const mockRolePermissions: RolePermission[] = [
  // Admin has all permissions
  { role_id: '1', permission_id: 1, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: '1', permission_id: 2, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: '1', permission_id: 3, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: '1', permission_id: 4, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: '1', permission_id: 5, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: '1', permission_id: 6, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: '1', permission_id: 7, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: '1', permission_id: 8, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: '1', permission_id: 9, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: '1', permission_id: 10, assigned_at: '2024-01-01T10:00:00Z' },
  // Doctor has patient and appointment permissions
  { role_id: '2', permission_id: 5, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: '2', permission_id: 6, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: '2', permission_id: 7, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: '2', permission_id: 8, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: '2', permission_id: 9, assigned_at: '2024-01-01T10:00:00Z' },
  // Nurse has patient view and appointment permissions
  { role_id: '3', permission_id: 7, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: '3', permission_id: 8, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: '3', permission_id: 9, assigned_at: '2024-01-01T10:00:00Z' },
  // Receptionist has appointment permissions
  { role_id: '4', permission_id: 8, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: '4', permission_id: 9, assigned_at: '2024-01-01T10:00:00Z' },
];

export const getRolePermissions = async (roleId: string): Promise<RolePermission[]> => {
  await delay(300);
  return mockRolePermissions
    .filter(rp => rp.role_id === roleId)
    .map(rp => ({
      ...rp,
      permission: mockPermissions.find(p => p.id === rp.permission_id),
    }));
};

export const assignPermissionToRole = async (roleId: string, permissionId: number): Promise<RolePermission> => {
  await delay(500);
  // Check if already assigned
  const existing = mockRolePermissions.find(rp => rp.role_id === roleId && rp.permission_id === permissionId);
  if (existing) {
    return { ...existing, permission: mockPermissions.find(p => p.id === permissionId) };
  }
  
  const newRolePermission: RolePermission = {
    role_id: roleId,
    permission_id: permissionId,
    assigned_at: new Date().toISOString(),
    permission: mockPermissions.find(p => p.id === permissionId),
  };
  mockRolePermissions.push(newRolePermission);
  return newRolePermission;
};

export const removePermissionFromRole = async (roleId: string, permissionId: number): Promise<void> => {
  await delay(500);
  const index = mockRolePermissions.findIndex(rp => rp.role_id === roleId && rp.permission_id === permissionId);
  if (index !== -1) {
    mockRolePermissions.splice(index, 1);
    return;
  }
  throw new Error('Role permission not found');
};
