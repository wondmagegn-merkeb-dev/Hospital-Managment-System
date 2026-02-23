import type { UserFormData } from '../validation/user';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string; // UUID
  username: string;
  email: string;
  password_hash?: string; // Not exposed in forms, but part of schema
  full_name: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  deleted_at: string | null;
  // Roles are now in a separate many-to-many table (user_roles)
  // This field is for backward compatibility and display purposes
  roles?: Array<{ id: string; name: string }>; // UUID
}

export interface PaginatedUsersResponse {
  data: User[];
  total: number;
}

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  editingUser?: User | null;
  isLoading?: boolean;
}
