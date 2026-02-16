import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRolesPaginated,
  createRole,
  updateRole,
  deleteRole,
  getRoles,
} from '../services/roleService';
import type { SortDirection } from '../components/Table';

export const useRolesQuery = (
  search: string = '',
  page: number = 1,
  pageSize: number = 10,
  sortColumn: string | null = null,
  sortDirection: SortDirection = null
) => {
  return useQuery({
    queryKey: ['roles', page, pageSize, sortColumn, sortDirection, search],
    queryFn: () => getRolesPaginated(page, pageSize, sortColumn, sortDirection, search),
    placeholderData: (previousData) => previousData,
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles', 'all'],
    queryFn: () => getRoles(),
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string | null; permissionIds?: number[] }) => createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['rolePermissions'] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ name: string; description?: string | null; permissionIds?: number[] }> }) =>
      updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['rolePermissions'] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};
