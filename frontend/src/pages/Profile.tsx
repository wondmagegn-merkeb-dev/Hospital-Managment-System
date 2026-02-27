import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  User,
  Lock,
  Save,
  CheckCircle,
  Mail,
  AtSign,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, type ProfileUpdateData } from '../services/authService';
import type { AxiosError } from 'axios';

interface ProfileFormData {
  full_name: string;
}

interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, isLoading, refreshUser } = useAuth();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>();

  const newPassword = watch('new_password');

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsProfileLoading(true);
    setProfileSuccess(false);
    try {
      const payload: ProfileUpdateData = { full_name: data.full_name || null };
      await updateProfile(payload);
      await refreshUser();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      toast.error(axiosErr.response?.data?.detail ?? 'Failed to update profile');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsPasswordLoading(true);
    setPasswordSuccess(false);
    try {
      await updateProfile({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      resetPassword();
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      toast.error(axiosErr.response?.data?.detail ?? 'Failed to change password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      resetProfile({ full_name: user.full_name ?? '' });
    }
  }, [user?.id, user?.full_name, resetProfile]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/20" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const initials = (user.full_name || user.username)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Profile Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3339cd] via-[#4f46e5] to-[#7c3aed] p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'60\' height=\'60\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 60 0 L 0 0 0 60\' fill=\'none\' stroke=\'rgba(255,255,255,0.08)\' stroke-width=\'1\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23grid)\'/%3E%3C/svg%3E')] opacity-50" />
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
            {initials}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {user.full_name || user.username}
            </h1>
            <p className="text-white/80 mt-1 flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
              {user.roles?.map((r) => (
                <span
                  key={r.id}
                  className="px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium backdrop-blur-sm"
                >
                  {r.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info Card */}
          <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-sm shadow-lg overflow-hidden transition-all hover:shadow-xl">
            <div className="px-6 py-4 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Personal Information</h2>
                  <p className="text-sm text-muted-foreground">Update your display name</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/90 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    {...registerProfile('full_name', { maxLength: 150 })}
                    className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    placeholder="Enter your full name"
                  />
                  {profileErrors.full_name && (
                    <p className="text-sm text-destructive mt-1.5">
                      {profileErrors.full_name.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isProfileLoading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[#3339cd] text-white hover:bg-[#2a2fb5] shadow-md hover:shadow-lg active:scale-[0.98]"
                  >
                    {profileSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {isProfileLoading ? 'Saving...' : 'Save Changes'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Change Password Card - Collapsible */}
          <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-sm shadow-lg overflow-hidden transition-all hover:shadow-xl">
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="w-full px-6 py-4 border-b border-border/50 bg-muted/30 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#3339cd]/10">
                  <Lock className="w-5 h-5 text-[#3339cd]" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold">Security</h2>
                  <p className="text-sm text-muted-foreground">Change your password</p>
                </div>
              </div>
              {showPasswordSection ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            {showPasswordSection && (
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/90 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword('current_password', {
                      required: 'Current password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                  {passwordErrors.current_password && (
                    <p className="text-sm text-destructive mt-1.5">
                      {passwordErrors.current_password.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/90 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword('new_password', {
                      required: 'New password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                  {passwordErrors.new_password && (
                    <p className="text-sm text-destructive mt-1.5">
                      {passwordErrors.new_password.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/90 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword('confirm_password', {
                      required: 'Please confirm your password',
                      validate: (val) => val === newPassword || 'Passwords do not match',
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                  {passwordErrors.confirm_password && (
                    <p className="text-sm text-destructive mt-1.5">
                      {passwordErrors.confirm_password.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isPasswordLoading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[#3339cd] text-white hover:bg-[#2a2fb5] shadow-md hover:shadow-lg active:scale-[0.98]"
                  >
                    {passwordSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Password Updated
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        {isPasswordLoading ? 'Updating...' : 'Update Password'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar - Account Details */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Account Details</h3>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3">
                <AtSign className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Username
                  </p>
                  <p className="font-medium mt-0.5">{user.username}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </p>
                  <p className="font-medium mt-0.5 break-all">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Roles
                  </p>
                  <p className="font-medium mt-0.5">
                    {user.roles?.map((r) => r.name).join(', ') || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
