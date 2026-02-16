import type { Role, Permission, UserRole, RolePermission, PaginatedRolesResponse, PaginatedPermissionsResponse } from '../types/role';
import type { SortDirection } from '../components/Table';

// Mock data for roles
const mockRoles: Role[] = [
  { id: 1, name: 'Admin', description: 'System administrator with full access', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 2, name: 'Doctor', description: 'Medical doctor with patient care access', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 3, name: 'Nurse', description: 'Nursing staff with patient care access', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
  { id: 4, name: 'Receptionist', description: 'Front desk staff with appointment access', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', deleted_at: null },
];

// Mock data for permissions organized by module
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

// Mock data for user_roles (many-to-many)
const mockUserRoles: UserRole[] = [
  { user_id: 1, role_id: 1, assigned_at: '2024-01-15T10:00:00Z' }, // admin user has Admin role
  { user_id: 2, role_id: 2, assigned_at: '2024-01-16T10:00:00Z' }, // doctor1 has Doctor role
  { user_id: 3, role_id: 2, assigned_at: '2024-01-17T10:00:00Z' }, // doctor2 has Doctor role
  { user_id: 4, role_id: 3, assigned_at: '2024-01-18T10:00:00Z' }, // nurse1 has Nurse role
  { user_id: 5, role_id: 3, assigned_at: '2024-01-19T10:00:00Z' }, // nurse2 has Nurse role
  { user_id: 6, role_id: 4, assigned_at: '2024-01-20T10:00:00Z' }, // reception1 has Receptionist role
  { user_id: 7, role_id: 4, assigned_at: '2024-01-21T10:00:00Z' }, // reception2 has Receptionist role
];

// Mock data for role_permissions (many-to-many)
const mockRolePermissions: RolePermission[] = [
  // Admin has all permissions
  { role_id: 1, permission_id: 1, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: 1, permission_id: 2, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: 1, permission_id: 3, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: 1, permission_id: 4, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: 1, permission_id: 5, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: 1, permission_id: 6, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: 1, permission_id: 7, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: 1, permission_id: 8, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: 1, permission_id: 9, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: 1, permission_id: 10, assigned_at: '2024-01-01T10:00:00Z' },
  // Doctor has patient and appointment permissions
  { role_id: 2, permission_id: 5, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: 2, permission_id: 6, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: 2, permission_id: 7, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: 2, permission_id: 8, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: 2, permission_id: 9, assigned_at: '2024-01-01T10:00:00Z' },
  // Nurse has patient view and appointment permissions
  { role_id: 3, permission_id: 7, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: 3, permission_id: 8, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: 3, permission_id: 9, assigned_at: '2024-01-01T10:00:00Z' },
  // Receptionist has appointment permissions
  { role_id: 4, permission_id: 8, assigned_at: '2024-01-01T10:00:00Z' },
  { role_id: 4, permission_id: 9, assigned_at: '2024-01-01T10:00:00Z' },
];

// Simulate API delay
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Role CRUD operations
export const getRoles = async (): Promise<Role[]> => {
  await delay(300);
  return mockRoles.filter(role => role.deleted_at === null);
};

export const getRoleById = async (id: number): Promise<Role | undefined> => {
  await delay(300);
  return mockRoles.find(role => role.id === id && role.deleted_at === null);
};

export const createRole = async (roleData: { name: string; description?: string | null; permissionIds?: number[] }): Promise<Role> => {
  await delay(500);
  const now = new Date().toISOString();
  const newRole: Role = {
    id: mockRoles.length + 1,
    name: roleData.name,
    description: roleData.description || null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };
  mockRoles.push(newRole);
  
  // Assign permissions if provided
  if (roleData.permissionIds && roleData.permissionIds.length > 0) {
    await Promise.all(roleData.permissionIds.map(permissionId => assignPermissionToRole(newRole.id, permissionId)));
  }
  
  return newRole;
};

export const updateRole = async (id: number, roleData: { name?: string; description?: string | null; permissionIds?: number[] }): Promise<Role> => {
  await delay(500);
  const index = mockRoles.findIndex(role => role.id === id);
  if (index !== -1) {
    mockRoles[index] = {
      ...mockRoles[index],
      name: roleData.name ?? mockRoles[index].name,
      description: roleData.description !== undefined ? roleData.description : mockRoles[index].description,
      updated_at: new Date().toISOString(),
    };
    
    // Update permissions if provided
    if (roleData.permissionIds !== undefined) {
      const currentPermissions = await getRolePermissions(id);
      const currentPermissionIds = currentPermissions.map(rp => rp.permission_id);
      const newPermissionIds = roleData.permissionIds;
      
      // Remove permissions that are no longer assigned
      const permissionsToRemove = currentPermissionIds.filter(pid => !newPermissionIds.includes(pid));
      await Promise.all(permissionsToRemove.map(permissionId => removePermissionFromRole(id, permissionId)));
      
      // Add new permissions
      const permissionsToAdd = newPermissionIds.filter(pid => !currentPermissionIds.includes(pid));
      await Promise.all(permissionsToAdd.map(permissionId => assignPermissionToRole(id, permissionId)));
    }
    
    return mockRoles[index];
  }
  throw new Error('Role not found');
};

export const deleteRole = async (id: number): Promise<void> => {
  await delay(500);
  const index = mockRoles.findIndex(role => role.id === id);
  if (index !== -1) {
    mockRoles[index].deleted_at = new Date().toISOString();
    return;
  }
  throw new Error('Role not found');
};

export const getRolesPaginated = async (
  page: number = 1,
  pageSize: number = 10,
  sortColumn: string | null = null,
  sortDirection: SortDirection = null,
  search: string = ''
): Promise<PaginatedRolesResponse> => {
  await delay(500);
  
  let filteredRoles = mockRoles.filter(role => role.deleted_at === null);
  
  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredRoles = filteredRoles.filter(role => 
      role.name.toLowerCase().includes(searchLower) ||
      (role.description && role.description.toLowerCase().includes(searchLower))
    );
  }
  
  // Apply sorting
  if (sortColumn && sortDirection) {
    filteredRoles.sort((a, b) => {
      let aValue: string | number | null = a[sortColumn as keyof Role] as string | number | null;
      let bValue: string | number | null = b[sortColumn as keyof Role] as string | number | null;
      
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
  const total = filteredRoles.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRoles = filteredRoles.slice(startIndex, endIndex);
  
  return {
    data: paginatedRoles,
    total: total,
  };
};

// Permission CRUD operations
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
export const getUserRoles = async (userId: number): Promise<UserRole[]> => {
  await delay(300);
  return mockUserRoles
    .filter(ur => ur.user_id === userId)
    .map(ur => ({
      ...ur,
      role: mockRoles.find(r => r.id === ur.role_id),
    }));
};

export const assignRoleToUser = async (userId: number, roleId: number): Promise<UserRole> => {
  await delay(500);
  // Check if already assigned
  const existing = mockUserRoles.find(ur => ur.user_id === userId && ur.role_id === roleId);
  if (existing) {
    return { ...existing, role: mockRoles.find(r => r.id === roleId) };
  }
  
  const newUserRole: UserRole = {
    user_id: userId,
    role_id: roleId,
    assigned_at: new Date().toISOString(),
    role: mockRoles.find(r => r.id === roleId),
  };
  mockUserRoles.push(newUserRole);
  return newUserRole;
};

export const removeRoleFromUser = async (userId: number, roleId: number): Promise<void> => {
  await delay(500);
  const index = mockUserRoles.findIndex(ur => ur.user_id === userId && ur.role_id === roleId);
  if (index !== -1) {
    mockUserRoles.splice(index, 1);
    return;
  }
  throw new Error('User role not found');
};

// Role-Permission mapping operations
export const getRolePermissions = async (roleId: number): Promise<RolePermission[]> => {
  await delay(300);
  return mockRolePermissions
    .filter(rp => rp.role_id === roleId)
    .map(rp => ({
      ...rp,
      permission: mockPermissions.find(p => p.id === rp.permission_id),
    }));
};

export const assignPermissionToRole = async (roleId: number, permissionId: number): Promise<RolePermission> => {
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

export const removePermissionFromRole = async (roleId: number, permissionId: number): Promise<void> => {
  await delay(500);
  const index = mockRolePermissions.findIndex(rp => rp.role_id === roleId && rp.permission_id === permissionId);
  if (index !== -1) {
    mockRolePermissions.splice(index, 1);
    return;
  }
  throw new Error('Role permission not found');
};
