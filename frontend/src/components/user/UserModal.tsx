import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import { createUserSchema, updateUserSchema, type UserFormData } from '../../validation/user';
import type { UserModalProps } from '../../types/user';

const roles = ['admin', 'doctor', 'nurse', 'receptionist'] as const;
const statuses = ['active', 'inactive', 'suspended'] as const;

export default function UserModal({
  isOpen,
  onClose,
  onSubmit,
  editingUser,
  isLoading = false,
}: UserModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(editingUser ? updateUserSchema : createUserSchema),
    defaultValues: editingUser
      ? {
          email: editingUser.email,
          username: editingUser.username,
          full_name: editingUser.full_name || '',
          role: editingUser.role as 'admin' | 'doctor' | 'nurse' | 'receptionist',
          status: editingUser.status,
          password: undefined,
        }
      : {
          email: '',
          username: '',
          full_name: '',
          role: 'receptionist',
          status: 'active',
          password: '',
        },
  });

  // Reset form when modal opens/closes or editingUser changes
  useEffect(() => {
    if (isOpen) {
      if (editingUser) {
        reset({
          email: editingUser.email,
          username: editingUser.username,
          full_name: editingUser.full_name || '',
          role: editingUser.role as 'admin' | 'doctor' | 'nurse' | 'receptionist',
          status: editingUser.status,
          password: undefined,
        });
      } else {
        reset({
          email: '',
          username: '',
          full_name: '',
          role: 'receptionist',
          status: 'active',
          password: '',
        });
      }
    }
  }, [isOpen, editingUser, reset]);

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
          className="text-2xl font-bold text-gray-900 mb-6 leading-tight tracking-tight"
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

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('username')}
              className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                errors.username
                  ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500'
                  : 'border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50'
              } focus:outline-none`}
              placeholder="username"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

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

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              {...register('role')}
              className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                errors.role
                  ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500'
                  : 'border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50'
              } focus:outline-none`}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          {/* Password - Only for new users */}
          {!editingUser && (
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...register('password')}
                className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                  errors.password
                    ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500'
                    : 'border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50'
                } focus:outline-none`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          )}

          {/* Status */}
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
