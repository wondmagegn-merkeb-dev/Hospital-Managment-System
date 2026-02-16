export interface Role {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Permission {
  id: number;
  name: string;
  description: string | null;
  module: string; // Module name (e.g., 'User Management', 'Patients', etc.)
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface UserRole {
  user_id: number;
  role_id: number;
  assigned_at: string;
  // Joined data (optional, for display)
  role?: Role;
}

export interface RolePermission {
  role_id: number;
  permission_id: number;
  assigned_at: string;
  // Joined data (optional, for display)
  permission?: Permission;
}

export interface PaginatedRolesResponse {
  data: Role[];
  total: number;
}

export interface PaginatedPermissionsResponse {
  data: Permission[];
  total: number;
}
