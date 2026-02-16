import { z } from 'zod';

// Zod validation schema for creating a role
export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(50, 'Role name must be less than 50 characters'),
  description: z.string().max(255, 'Description must be less than 255 characters').optional().nullable(),
  permissionIds: z.array(z.number()).optional(),
});

// Zod validation schema for updating a role
export const updateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(50, 'Role name must be less than 50 characters'),
  description: z.string().max(255, 'Description must be less than 255 characters').optional().nullable(),
  permissionIds: z.array(z.number()).optional(),
});

// Type inference from schemas
export type CreateRoleFormData = z.infer<typeof createRoleSchema>;
export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;
export type RoleFormData = CreateRoleFormData | UpdateRoleFormData;
