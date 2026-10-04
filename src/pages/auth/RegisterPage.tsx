import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Lock, Mail, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TechnicalGrid } from '../../components/TechnicalGrid';

interface RegisterPageProps {
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
  onRegisterSuccess: (role: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateHome,
  onNavigateLogin,
  onRegisterSuccess,
}) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      onRegisterSuccess(user.role);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check the provided information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090C] text-white flex flex-col justify-center items-center px-4 sm:px-6 relative overflow-hidden py-12">
      <TechnicalGrid />

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
          // Create Client Workspace
        </p>
      </div>

      <div className="relative z-10 w-full max-w-md bg-[#101419] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-white tracking-tight">
            Register Account
          </h2>
          <p className="text-xs text-[#9BA3AE] mt-1">
            Access your spatial assets, tour deliverables, and schedule bookings.
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
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#9BA3AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Rahul Sharma"
                required
                className="w-full bg-[#07090C] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00F2FE] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9BA3AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="rahul@example.com"
                required
                className="w-full bg-[#07090C] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00F2FE] transition-colors font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#9BA3AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-[#07090C] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00F2FE] transition-colors font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9BA3AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00F2FE] transition-colors font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                Confirm *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9BA3AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00F2FE] transition-colors font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl font-tech font-bold text-sm bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
          >
            {isSubmitting ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#9BA3AE]">
          Already have an account?{' '}
          <button
            onClick={onNavigateLogin}
            className="text-[#00F2FE] font-semibold hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
