import { z } from 'zod';

// Zod validation schema for creating a user (username and password optional - backend auto-generates if not provided)
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required').max(100, 'Email must be less than 100 characters'),
  username: z.union([
    z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters'),
    z.literal(''),
  ]).optional(),
  password: z.union([
    z.string().min(6, 'Password must be at least 6 characters'),
    z.literal(''),
  ]).optional(),
  full_name: z.string().max(150, 'Full name must be less than 150 characters').optional().nullable(),
  roleIds: z.array(z.string().uuid()).min(1, 'At least one role must be assigned').optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});

// Zod validation schema for updating a user
export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required').max(100, 'Email must be less than 100 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters'),
  full_name: z.string().max(150, 'Full name must be less than 150 characters').optional().nullable(),
  roleIds: z.array(z.string().uuid()).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});

// Type inference from schemas
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type UserFormData = CreateUserFormData | UpdateUserFormData;
