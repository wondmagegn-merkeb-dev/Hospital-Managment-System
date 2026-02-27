import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import { createUserSchema, updateUserSchema, type UserFormData } from '../../validation/user';
import { getRoles } from '../../services/roleService';
import { SUPER_ADMIN_ROLE_NAME } from '../../config/constants';
import type { UserModalProps } from '../../types/user';
import type { Role } from '../../types/role';

const statuses = ['active', 'inactive', 'suspended'] as const;

export default function UserModal({
  isOpen,
  onClose,
  onSubmit,
  editingUser,
  isLoading = false,
}: UserModalProps) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  // Fetch all roles from backend
  const { data: roles } = useQuery({
    queryKey: ['roles', 'all'],
    queryFn: () => getRoles(),
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(editingUser ? updateUserSchema : createUserSchema),
    defaultValues: editingUser
      ? {
          email: editingUser.email,
          username: editingUser.username,
          full_name: editingUser.full_name || '',
          roleIds: editingUser.roles?.map((r) => r.id) || [],
          status: editingUser.status,
          password: undefined,
        }
      : {
          email: '',
          username: '',
          password: '',
          full_name: '',
          roleIds: [],
          status: 'active',
        },
  });

  // Reset form when modal opens/closes or editingUser changes
  useEffect(() => {
    if (isOpen) {
      if (editingUser) {
        const userRoleIds = editingUser.roles?.map((r) => r.id) || [];
        setSelectedRoleIds(userRoleIds);
        reset({
          email: editingUser.email,
          username: editingUser.username,
          full_name: editingUser.full_name || '',
          roleIds: userRoleIds,
          status: editingUser.status,
          password: undefined,
        });
      } else {
        setSelectedRoleIds([]);
        reset(
          {
            email: '',
            username: '',
            password: '',
            full_name: '',
            roleIds: [],
            status: 'active',
          },
          { keepDefaultValues: false }
        );
        setValue('status', 'active');
      }
    }
  }, [isOpen, editingUser, reset, setValue]);

  const toggleRole = (roleId: string) => {
    const newRoleIds = selectedRoleIds.includes(roleId)
      ? selectedRoleIds.filter((id) => id !== roleId)
      : [...selectedRoleIds, roleId];
    setSelectedRoleIds(newRoleIds);
    setValue('roleIds', newRoleIds, { shouldValidate: true });
  };

  const onFormSubmit = (data: UserFormData) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white border border-border/50 rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-fade-in transform scale-100 mx-4 relative overflow-hidden"
        style={{
          boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-accent/50 transition-all duration-200 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2
          className="text-2xl font-bold text-gray-900 mb-4 leading-tight tracking-tight"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: '24px',
            lineHeight: '1.2',
            letterSpacing: '-0.02em',
          }}
        >
          {editingUser ? 'Edit User' : 'Add New User'}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Email */}
          {editingUser ?   
          (<div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Email
            </label>
            <input
              type="email"
              readOnly
              {...register('email')}
               className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-gray-50 text-gray-600 cursor-not-allowed"
               placeholder="user@example.com"
            />
          </div> ) :  (
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register('email')}
              className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                errors.email
                  ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500'
                  : 'border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50'
              } focus:outline-none`}
              placeholder="user@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        )}
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              {...register('full_name')}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-primary/50"
              placeholder="John Doe"
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
            )}
          </div>

          {/* Username - optional when creating, read-only when editing */}
          {editingUser ? (
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                Username
              </label>
              <input
                type="text"
                {...register('username')}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="Auto-generated"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                Username
              </label>
              <input
                type="text"
                {...register('username')}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-primary/50"
                placeholder="Optional - auto-generated from email if empty"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>
          )}

          {/* Password - optional when creating */}
          {!editingUser && (
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                Password
              </label>
              <input
                type="password"
                {...register('password')}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-primary/50"
                placeholder="Optional - auto-generated and emailed if empty"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          )}



          {/* Roles */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Roles {!editingUser && <span className="text-red-500">*</span>}
            </label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto border-2 border-input rounded-xl p-3 bg-background/50">
              {roles && roles.filter((r) => r.name !== SUPER_ADMIN_ROLE_NAME).length > 0 ? (
                roles
                  .filter((role) => role.name !== SUPER_ADMIN_ROLE_NAME)
                  .map((role: Role) => (
                  <label
                    key={role.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 px-3 py-2 rounded-lg transition-colors shrink-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2 shrink-0"
                    />
                    <span className="text-sm text-gray-700">{role.name}</span>
                    {role.description && (
                      <Tooltip content={role.description} position="top">
                        <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 shrink-0" />
                      </Tooltip>
                    )}
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-2 w-full">
                  No roles available
                </p>
              )}
            </div>
            <input
              type="hidden"
              {...register('roleIds')}
            />
            {errors.roleIds && (
              <p className="mt-1 text-sm text-red-600">{errors.roleIds.message}</p>
            )}
          </div>

          {!editingUser && (
            <p className="text-sm text-gray-500 -mt-2">
              Leave username and password blank to auto-generate. Credentials will be sent to the user&apos;s email.
            </p>
          )}

          {/* Status - only when editing (new users default to active) */}
          {editingUser && (
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                {...register('status')}
                className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                  errors.status
                    ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500'
                    : 'border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50'
                } focus:outline-none`}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-border/50 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="font-semibold text-sm"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading}
              className="font-semibold text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {isLoading ? 'Saving...' : editingUser ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
