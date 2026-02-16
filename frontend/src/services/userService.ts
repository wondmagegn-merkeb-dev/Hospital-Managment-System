import type { UserFormData } from '../validation/user';
import type { SortDirection } from '../components/Table';
import type { User, PaginatedUsersResponse } from '../types/user';
import { getUserRoles } from './roleService';

export type { User, PaginatedUsersResponse };

// Helper function to create a mock user with all required fields
const createMockUser = (
  id: number,
  email: string,
  username: string,
  full_name: string | null,
  status: 'active' | 'inactive' | 'suspended',
  created_at: string,
  last_login: string | null = null
): User => ({
  id,
  email,
  username,
  full_name,
  status,
  created_at,
  updated_at: created_at,
  last_login,
  deleted_at: null,
});

// Mock data for testing without backend
const mockUsers: User[] = [
  createMockUser(1, 'admin@hospital.com', 'admin', 'Admin User', 'active', '2024-01-15T10:00:00Z'),
  createMockUser(2, 'doctor1@hospital.com', 'doctor1', 'Dr. John Smith', 'active', '2024-01-16T10:00:00Z'),
  createMockUser(3, 'doctor2@hospital.com', 'doctor2', 'Dr. Sarah Johnson', 'active', '2024-01-17T10:00:00Z'),
  createMockUser(4, 'nurse1@hospital.com', 'nurse1', 'Nurse Mary Williams', 'active', '2024-01-18T10:00:00Z'),
  createMockUser(5, 'nurse2@hospital.com', 'nurse2', 'Nurse James Brown', 'active', '2024-01-19T10:00:00Z'),
  createMockUser(6, 'reception1@hospital.com', 'reception1', 'Receptionist Emily Davis', 'active', '2024-01-20T10:00:00Z'),
  createMockUser(7, 'reception2@hospital.com', 'reception2', 'Receptionist Michael Wilson', 'inactive', '2024-01-21T10:00:00Z'),
  createMockUser(8, 'doctor3@hospital.com', 'doctor3', 'Dr. Robert Taylor', 'active', '2024-01-22T10:00:00Z'),
  createMockUser(9, 'nurse3@hospital.com', 'nurse3', 'Nurse Lisa Anderson', 'active', '2024-01-23T10:00:00Z'),
  createMockUser(10, 'admin2@hospital.com', 'admin2', 'Admin Manager', 'active', '2024-01-24T10:00:00Z'),
  createMockUser(11, 'doctor4@hospital.com', 'doctor4', 'Dr. David Martinez', 'active', '2024-01-25T10:00:00Z'),
  createMockUser(12, 'nurse4@hospital.com', 'nurse4', 'Nurse Jennifer Lee', 'suspended', '2024-01-26T10:00:00Z'),
  createMockUser(13, 'reception3@hospital.com', 'reception3', 'Receptionist Kevin White', 'active', '2024-01-27T10:00:00Z'),
  createMockUser(14, 'doctor5@hospital.com', 'doctor5', 'Dr. Amanda Harris', 'active', '2024-01-28T10:00:00Z'),
  createMockUser(15, 'nurse5@hospital.com', 'nurse5', 'Nurse Christopher Clark', 'active', '2024-01-29T10:00:00Z'),
  createMockUser(16, 'reception4@hospital.com', 'reception4', 'Receptionist Jessica Lewis', 'active', '2024-01-30T10:00:00Z'),
  createMockUser(17, 'admin3@hospital.com', 'admin3', 'Admin Assistant', 'active', '2024-02-01T10:00:00Z'),
  createMockUser(18, 'doctor6@hospital.com', 'doctor6', 'Dr. Matthew Walker', 'active', '2024-02-02T10:00:00Z'),
  createMockUser(19, 'nurse6@hospital.com', 'nurse6', 'Nurse Nicole Hall', 'active', '2024-02-03T10:00:00Z'),
  createMockUser(20, 'reception5@hospital.com', 'reception5', 'Receptionist Daniel Young', 'inactive', '2024-02-04T10:00:00Z'),
];

// Simulate API delay
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export const getUsers = async (): Promise<User[]> => {
  await delay(22500);
  return mockUsers;
};

export const getUserById = async (id: number): Promise<User | undefined> => {
  await delay(300);
  const user = mockUsers.find(user => user.id === id);
  if (user) {
    const userRoles = await getUserRoles(user.id);
    return {
      ...user,
      roles: userRoles.map(ur => ({ id: ur.role_id, name: ur.role?.name || 'Unknown' })),
    };
  }
  return undefined;
};

export const createUser = async (userData: UserFormData): Promise<User> => {
  await delay(500);
  const now = new Date().toISOString();
  const newUser: User = {
    id: mockUsers.length + 1,
    email: userData.email,
    username: userData.username,
    full_name: userData.full_name || null,
    status: userData.status || 'active',
    created_at: now,
    updated_at: now,
    last_login: null,
    deleted_at: null,
    roles: [],
  };
  mockUsers.push(newUser);
  
  // Assign roles if provided
  if ('roleIds' in userData && userData.roleIds && userData.roleIds.length > 0) {
    const { assignRoleToUser, getUserRoles } = await import('./roleService');
    await Promise.all((userData.roleIds as number[]).map((roleId: number) => assignRoleToUser(newUser.id, roleId)));
    const userRoles = await getUserRoles(newUser.id);
    newUser.roles = userRoles.map(ur => ({ id: ur.role_id, name: ur.role?.name || 'Unknown' }));
  }
  
  return newUser;
};

export const updateUser = async (id: number, userData: Partial<UserFormData>): Promise<User> => {
  await delay(500);
  const index = mockUsers.findIndex(user => user.id === id);
  if (index !== -1) {
    const updatedUser: User = { 
      ...mockUsers[index], 
      email: userData.email ?? mockUsers[index].email,
      username: userData.username ?? mockUsers[index].username,
      full_name: userData.full_name !== undefined ? userData.full_name : mockUsers[index].full_name,
      status: userData.status ?? mockUsers[index].status,
      updated_at: new Date().toISOString(),
    };
    mockUsers[index] = updatedUser;
    
    // Update roles if provided
    if (userData.roleIds !== undefined) {
      const { getUserRoles, assignRoleToUser, removeRoleFromUser } = await import('./roleService');
      const currentRoles = await getUserRoles(id);
      const currentRoleIds = currentRoles.map(ur => ur.role_id);
      const newRoleIds = userData.roleIds;
      
      // Remove roles that are no longer assigned
      const rolesToRemove = currentRoleIds.filter(rid => !newRoleIds.includes(rid));
      await Promise.all(rolesToRemove.map(roleId => removeRoleFromUser(id, roleId)));
      
      // Add new roles
      const rolesToAdd = newRoleIds.filter(rid => !currentRoleIds.includes(rid));
      await Promise.all(rolesToAdd.map(roleId => assignRoleToUser(id, roleId)));
      
      // Update roles in user object
      const updatedRoles = await getUserRoles(id);
      updatedUser.roles = updatedRoles.map(ur => ({ id: ur.role_id, name: ur.role?.name || 'Unknown' }));
    } else {
      // Fetch current roles
      const userRoles = await getUserRoles(id);
      updatedUser.roles = userRoles.map(ur => ({ id: ur.role_id, name: ur.role?.name || 'Unknown' }));
    }
    
    return updatedUser;
  }
  throw new Error('User not found');
};

export const deleteUser = async (id: number): Promise<void> => {
  await delay(500);
  const index = mockUsers.findIndex(user => user.id === id);
  if (index !== -1) {
    mockUsers.splice(index, 1);
    return;
  }
  throw new Error('User not found');
};

export const getUsersPaginated = async (
  page: number = 1,
  pageSize: number = 10,
  sortColumn: string | null = null,
  sortDirection: SortDirection = null,
  search: string = '',
  roleFilter: string = 'all'
): Promise<PaginatedUsersResponse> => {
  await delay(500); // Simulate API delay
  
  let filteredUsers = [...mockUsers];
  
  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.email.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchLower))
    );
  }
  
  // Apply sorting
  if (sortColumn && sortDirection) {
    filteredUsers.sort((a, b) => {
      let aValue: string | number | null = a[sortColumn as keyof User] as string | number | null;
      let bValue: string | number | null = b[sortColumn as keyof User] as string | number | null;
      
      // Handle null/undefined values
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';
      
      // Convert to string for comparison
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
  const total = filteredUsers.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  // Fetch roles for each user
  const usersWithRoles = await Promise.all(
    paginatedUsers.map(async (user) => {
      const userRoles = await getUserRoles(user.id);
      return {
        ...user,
        roles: userRoles.map(ur => ({ id: ur.role_id, name: ur.role?.name || 'Unknown' })),
      };
    })
  );
  
  // Apply role filter after fetching roles
  let finalUsers = usersWithRoles;
  let finalTotal = total;
  if (roleFilter && roleFilter !== 'all') {
    // Re-filter all users (not just paginated) for accurate total count
    const allUsersWithRoles = await Promise.all(
      filteredUsers.map(async (user) => {
        const userRoles = await getUserRoles(user.id);
        return {
          ...user,
          roles: userRoles.map(ur => ({ id: ur.role_id, name: ur.role?.name || 'Unknown' })),
        };
      })
    );
    const roleFiltered = allUsersWithRoles.filter(user => 
      user.roles?.some(role => role.name.toLowerCase() === roleFilter.toLowerCase())
    );
    finalTotal = roleFiltered.length;
    // Re-apply pagination after role filter
    const roleFilteredPaginated = roleFiltered.slice(startIndex, endIndex);
    finalUsers = roleFilteredPaginated;
  }
  
  return {
    data: finalUsers,
    total: finalTotal,
  };
};
