import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  Globe,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { api } from '../utils/authApi';
import { UserAccount, UserProfileData } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount, data: UserProfileData) => void;
  initialMode?: 'login' | 'signup' | 'forgot';
  currentLocalData?: UserProfileData;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
  currentLocalData,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [identifier, setIdentifier] = useState(''); // username or email for login
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [migrateData, setMigrateData] = useState(true);
  const [targetDailyHours, setTargetDailyHours] = useState(10);
  const [quote, setQuote] = useState('148 Days. 1 Goal. AIR Under 10,000 (95+ Percentile).');

  // Forgot / Reset fields
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await api.login(identifier, password);
      setSuccessMsg(`Welcome back, ${res.user.name || res.user.username}!`);
      setTimeout(() => {
        onAuthSuccess(res.user, res.data);
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.signup({
        username,
        email,
        password,
        name: name.trim() || username,
        targetDailyHours,
        targetPercentile: '95+ Percentile (AIR < 10,000)',
        quote,
        isPublic,
        initialData: migrateData ? currentLocalData : undefined,
      });

      setSuccessMsg(`Account created successfully! Welcome, @${res.user.username}`);
      setTimeout(() => {
        onAuthSuccess(res.user, res.data);
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await api.forgotPassword(forgotIdentifier);
      setSuccessMsg(res.message);
      if (res.resetCode) {
        setResetCode(res.resetCode);
        setMode('reset');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process password recovery request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.resetPassword(resetCode, newPassword);
      setSuccessMsg(res.message);
      setTimeout(() => {
        setMode('login');
        setPassword('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#121215] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header decoration */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500" />

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title and switcher */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white font-mono">
              {mode === 'login' && 'Sign In to JEE Mission 148'}
              {mode === 'signup' && 'Create Your JEE Aspirant Account'}
              {mode === 'forgot' && 'Reset Your Password'}
              {mode === 'reset' && 'Enter New Password'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              {mode === 'login' && 'Access your persistent 148-day logs across all devices'}
              {mode === 'signup' && 'Join the community, secure your cloud data & leaderboard rank'}
              {mode === 'forgot' && 'Enter your username or email to receive a reset code'}
              {mode === 'reset' && 'Enter your verification code and choose a new password'}
            </p>
          </div>

          {/* Tabs */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#18181B] rounded-xl border border-[#27272A] mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 text-xs font-mono font-medium rounded-lg transition cursor-pointer ${
                  mode === 'login'
                    ? 'bg-amber-500 text-black shadow-md font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 text-xs font-mono font-medium rounded-lg transition cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-amber-500 text-black shadow-md font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= LOGIN FORM ================= */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. nibir or nibir@jeemission148.com"
                    className="w-full bg-[#18181B] border border-[#27272A] focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] font-mono text-amber-500 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#18181B] border border-[#27272A] focus:border-amber-500 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In & Sync Cloud Data</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-[#27272A] text-center">
                <p className="text-xs text-zinc-500 font-mono">
                  Default profile accounts: <span className="text-zinc-300 font-bold">nibir</span> or <span className="text-zinc-300 font-bold">maitreyan</span>
                </p>
              </div>
            </form>
          )}

          {/* ================= SIGN UP FORM ================= */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  Unique User ID / Username <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="e.g. jee_topper_2027"
                    className="w-full bg-[#18181B] border border-[#27272A] focus:border-amber-500 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition font-mono"
                  />
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">Letters, numbers and underscores only (3-25 chars)</span>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  Full Name / Nickname
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aryan Sharma"
                    className="w-full bg-[#18181B] border border-[#27272A] focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  Email Address <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aspirant@gmail.com"
                    className="w-full bg-[#18181B] border border-[#27272A] focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition font-mono"
                  />
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">Kept 100% private. Used for recovery and sync.</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Password <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full bg-[#18181B] border border-[#27272A] focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Confirm Password <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-[#18181B] border border-[#27272A] focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              {/* Public Profile Toggle */}
              <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="mt-1 accent-amber-500 rounded cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-mono font-bold text-zinc-200 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-amber-500" />
                      <span>Public Profile (Leaderboard & Compare)</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-mono mt-0.5">
                      Allows comparing stats with other aspirants. Your password, email, and private notes are <strong className="text-emerald-400">never exposed</strong>.
                    </p>
                  </div>
                </label>
              </div>

              {/* Data Import Toggle */}
              {currentLocalData && (
                <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={migrateData}
                      onChange={(e) => setMigrateData(e.target.checked)}
                      className="accent-amber-500 rounded cursor-pointer"
                    />
                    <div className="text-xs font-mono text-zinc-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Import current session's 148-day data to this new account</span>
                    </div>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-4"
              >
                {loading ? <span>Creating Account...</span> : <span>Register & Link Data</span>}
              </button>
            </form>
          )}

          {/* ================= FORGOT PASSWORD ================= */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Enter Registered Email or Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="e.g. nibir or nibir@jeemission148.com"
                    className="w-full bg-[#18181B] border border-[#27272A] focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {loading ? <span>Generating Reset Code...</span> : <span>Send Reset Verification Code</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="w-full py-2 text-xs font-mono text-zinc-400 hover:text-white transition text-center cursor-pointer"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* ================= RESET PASSWORD ================= */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Verification / Reset Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                    placeholder="e.g. A1B2C3D4"
                    className="w-full bg-[#18181B] border border-[#27272A] focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition font-mono uppercase font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  New Secure Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-[#18181B] border border-[#27272A] focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {loading ? <span>Resetting Password...</span> : <span>Confirm & Update Password</span>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
