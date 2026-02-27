import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';
import type { AxiosError } from 'axios';

interface ChangePasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormData>();

  const newPassword = watch('new_password');

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    try {
      await updateProfile({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      await refreshUser();
      toast.success('Password changed successfully');
      navigate('/dashboard');
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      toast.error(axiosErr.response?.data?.detail ?? 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
    } else if (user.is_first_login === false) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user || user.is_first_login === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white/90 backdrop-blur-sm border border-indigo-200/50 rounded-2xl p-8 shadow-xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Change Password Required</h1>
                <p className="text-gray-600 text-sm mt-1">
                  For security, you must change your password on first login.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Current Password</label>
              <input
                type="password"
                {...register('current_password', {
                  required: 'Current password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                className="w-full px-4 py-3 rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your current password"
                autoComplete="current-password"
              />
              {errors.current_password && (
                <p className="text-sm text-red-600 mt-1">{errors.current_password.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">New Password</label>
              <input
                type="password"
                {...register('new_password', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                className="w-full px-4 py-3 rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter new password"
                autoComplete="new-password"
              />
              {errors.new_password && (
                <p className="text-sm text-red-600 mt-1">{errors.new_password.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Confirm New Password</label>
              <input
                type="password"
                {...register('confirm_password', {
                  required: 'Please confirm your password',
                  validate: (val) => val === newPassword || 'Passwords do not match',
                })}
                className="w-full px-4 py-3 rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
              {errors.confirm_password && (
                <p className="text-sm text-red-600 mt-1">{errors.confirm_password.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              {isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
