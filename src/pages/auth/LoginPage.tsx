import { PasswordInput } from '../../components/common/PasswordInput';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const user = await login(values);
      success(`Welcome back, ${user.name}!`, 'Signed In');

      if (user.role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'COORDINATOR') {
        navigate('/coordinator/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      error(
        err.response?.data?.message || 'Invalid email or password. Please check your credentials.',
        'Authentication Failed'
      );
    }
  };

  const handleQuickLogin = async (email: string, roleName: string) => {
    setLoadingRole(roleName);
    setValue('email', email);
    setValue('password', 'Password123!');
    try {
      const user = await login({ email, password: 'Password123!' });
      success(`Logged in as demo ${roleName}: ${user.name}`);

      if (user.role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'COORDINATOR') {
        navigate('/coordinator/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Quick login failed', 'Error');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-100/50 via-indigo-50/20 to-transparent pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-xl shadow-brand-500/20 mb-4">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Campus Connect
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          College Resource Management & Smart Booking Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/80">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                College Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@campusconnect.edu"
                  {...register('email')}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <PasswordInput
                  placeholder="••••••••••••"
                  {...register('password')}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Portal
            </Button>
          </form>

          {/* Quick Demo Pre-fill section */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Instant Demo Logins (1-Click)</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@campusconnect.edu', 'Super Admin')}
                disabled={loadingRole !== null}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium bg-indigo-50/80 hover:bg-indigo-100/80 text-indigo-900 border border-indigo-200/70 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <p className="font-bold">Super Admin</p>
                    <p className="text-[11px] text-indigo-700">admin@campusconnect.edu</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 bg-white/80 px-2 py-0.5 rounded shadow-sm">
                  {loadingRole === 'Super Admin' ? 'Logging in...' : 'Sign In'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickLogin('coordinator.cse@campusconnect.edu', 'CSE Coordinator')
                }
                disabled={loadingRole !== null}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/70 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">Department Coordinator</p>
                    <p className="text-[11px] text-emerald-700">coordinator.cse@campusconnect.edu</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-white/80 px-2 py-0.5 rounded shadow-sm">
                  {loadingRole === 'CSE Coordinator' ? 'Logging in...' : 'Sign In'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickLogin('alex.rivera@student.campusconnect.edu', 'Student')
                }
                disabled={loadingRole !== null}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium bg-sky-50/80 hover:bg-sky-100/80 text-sky-900 border border-sky-200/70 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <p className="font-bold">Student Account</p>
                    <p className="text-[11px] text-sky-700">alex.rivera@student.campusconnect.edu</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-sky-600 bg-white/80 px-2 py-0.5 rounded shadow-sm">
                  {loadingRole === 'Student' ? 'Logging in...' : 'Sign In'}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-bold text-brand-600 hover:text-brand-700 hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
