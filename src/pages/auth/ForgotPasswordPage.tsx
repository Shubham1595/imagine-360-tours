import React, { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { TechnicalGrid } from '../../components/TechnicalGrid';

interface ForgotPasswordPageProps {
  onNavigateLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateLogin,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#07090C] text-white flex flex-col justify-center items-center px-4 sm:px-6 relative overflow-hidden py-12">
      <TechnicalGrid />

      <div className="relative z-10 w-full max-w-md bg-[#101419] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <button
          onClick={onNavigateLogin}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#9BA3AE] hover:text-[#00F2FE] mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>

        <h2 className="text-2xl font-heading font-bold text-white tracking-tight mb-2">
          Reset Password
        </h2>
        <p className="text-xs text-[#9BA3AE] mb-6">
          Enter your registered email address and we'll send you instructions to reset your account password.
        </p>

        {isSubmitted ? (
          <div className="p-6 rounded-xl bg-[#07090C] border border-white/10 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE] flex items-center justify-center mx-auto text-[#00F2FE]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-[#CBD5E1]">
              Password reset link has been dispatched to <span className="text-[#00F2FE] font-mono">{email}</span> if it exists in our system.
            </p>
            <button
              onClick={onNavigateLogin}
              className="w-full py-3 rounded-xl font-tech text-xs font-semibold bg-white text-[#07090C] hover:bg-[#00F2FE] transition-colors cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9BA3AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00F2FE] transition-colors font-mono text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-tech font-bold text-sm bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-6"
            >
              <span>Send Reset Instructions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
