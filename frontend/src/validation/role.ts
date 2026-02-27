import { z } from 'zod';
import { SUPER_ADMIN_ROLE_NAME } from '../config/constants';

// Zod validation schema for creating a role
export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(50, 'Role name must be less than 50 characters'),
  description: z.string().max(255, 'Description must be less than 255 characters').optional().nullable(),
  permissionIds: z.array(z.number()).optional(),
}).refine((data) => data.name.trim().toLowerCase() !== SUPER_ADMIN_ROLE_NAME, {
  message: 'super_admin is a system role and cannot be created.',
  path: ['name'],
});

// Zod validation schema for updating a role
export const updateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(50, 'Role name must be less than 50 characters'),
  description: z.string().max(255, 'Description must be less than 255 characters').optional().nullable(),
  permissionIds: z.array(z.number()).optional(),
}).refine((data) => data.name.trim().toLowerCase() !== SUPER_ADMIN_ROLE_NAME, {
  message: 'super_admin is a system role and cannot be created.',
  path: ['name'],
});

// Type inference from schemas
export type CreateRoleFormData = z.infer<typeof createRoleSchema>;
export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;
export type RoleFormData = CreateRoleFormData | UpdateRoleFormData;
