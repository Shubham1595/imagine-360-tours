import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Lock, Mail, Sparkles, AlertCircle } from 'lucide-react';
import { TechnicalGrid } from '../../components/TechnicalGrid';

interface LoginPageProps {
  onNavigateHome: () => void;
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
  onLoginSuccess: (role: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateHome,
  onNavigateRegister,
  onNavigateForgotPassword,
  onLoginSuccess,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      onLoginSuccess(user.role);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090C] text-white flex flex-col justify-center items-center px-4 sm:px-6 relative overflow-hidden py-12">
      <TechnicalGrid />

      {/* Brand Header */}
      <div className="relative z-10 text-center mb-8">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#101419] border border-[#00F2FE]/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.2)]">
            <div className="w-4 h-4 rounded-full border border-[#00F2FE] border-dashed group-hover:rotate-180 transition-transform duration-700" />
          </div>
          <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
            IMAGINE <span className="text-[#00F2FE]">360</span>
          </span>
        </button>
        <p className="font-mono text-xs text-[#9BA3AE] tracking-widest uppercase mt-2">
          // Enterprise Access & CRM Portal
        </p>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-[#101419] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-white tracking-tight">
            Sign In to Platform
          </h2>
          <p className="text-xs text-[#9BA3AE] mt-1">
            Access your spatial projects, bookings, or enterprise CRM workspace.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9BA3AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@imagine360tours.in"
                required
                className="w-full bg-[#07090C] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00F2FE] transition-colors font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-[#CBD5E1] uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={onNavigateForgotPassword}
                className="text-xs font-mono text-[#00F2FE] hover:underline cursor-pointer"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9BA3AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-[#07090C] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00F2FE] transition-colors font-mono text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl font-tech font-bold text-sm bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Register Prompt */}
        <div className="mt-6 text-center text-xs text-[#9BA3AE]">
          Don't have an account?{' '}
          <button
            onClick={onNavigateRegister}
            className="text-[#00F2FE] font-semibold hover:underline cursor-pointer"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};
