import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { GraduationCap, Mail, ArrowLeft, KeyRound } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export const ForgotPasswordPage: React.FC = () => {
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [resetToken, setResetToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await authApi.forgotPassword(values.email);
      success(res.message || 'Password reset requested.');
      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to request reset', 'Error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-xl shadow-brand-500/20 mb-4">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Forgot Password
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter your registered college email to receive a password recovery token
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/80">
          {resetToken ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                <p className="font-bold text-sm mb-1">Password Reset Token Generated!</p>
                <p className="mb-2">Your reset token is:</p>
                <div className="font-mono bg-white p-2 rounded-lg border border-emerald-300 text-emerald-900 font-bold select-all break-all">
                  {resetToken}
                </div>
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate(`/reset-password?token=${resetToken}`)}
              >
                Proceed to Reset Password
              </Button>
            </div>
          ) : (
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
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                leftIcon={<KeyRound className="w-4 h-4" />}
              >
                Generate Reset Token
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-brand-600 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
