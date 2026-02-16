import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser, updateUser, deleteUser, getUsersPaginated } from '../services/userService';
import type { UserFormData } from '../validation/user';
import type { SortDirection } from '../components/Table';

// Hook for creating a user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserFormData) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Hook for updating a user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserFormData> }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Hook for deleting a user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Hook for fetching paginated users - returns query function
export function useUsersQuery(
  searchTerm?: string,
  roleFilter?: string
) {
  return (page: number, pageSize: number, sortColumn?: string | null, sortDirection?: SortDirection) => {
    return getUsersPaginated(page, pageSize, sortColumn, sortDirection, searchTerm, roleFilter);
  };
}

// Combined hook for all user operations
export function useUserOperations() {
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  return {
    createUser: createMutation.mutate,
    updateUser: updateMutation.mutate,
    deleteUser: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
}
