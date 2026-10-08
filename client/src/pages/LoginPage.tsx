import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/home';

  const [email, setEmail] = useState<string>(
    () => (location.state as any)?.email || localStorage.getItem('skillsync_saved_email') || ''
  );
  const [password, setPassword] = useState<string>(
    () => (location.state as any)?.password || localStorage.getItem('skillsync_saved_password') || ''
  );
  const [rememberMe, setRememberMe] = useState<boolean>(
    () => localStorage.getItem('skillsync_remember_me') !== 'false'
  );
  const [hasAutoFilled, setHasAutoFilled] = useState<boolean>(
    () => Boolean(
      (location.state as any)?.email ||
      localStorage.getItem('skillsync_saved_email')
    )
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email: email.trim(), password });
      if (rememberMe) {
        localStorage.setItem('skillsync_saved_email', email.trim());
        localStorage.setItem('skillsync_saved_password', password);
        localStorage.setItem('skillsync_remember_me', 'true');
      } else {
        localStorage.removeItem('skillsync_saved_email');
        localStorage.removeItem('skillsync_saved_password');
        localStorage.setItem('skillsync_remember_me', 'false');
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold text-slate-900 tracking-tight">
          Welcome back to SkillSync
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          "Learn together. Teach what you know."
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Navigation Breadcrumb */}
        <div className="mb-3 flex items-center justify-between px-1">
          <NavLink
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </NavLink>
          <NavLink
            to="/register"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            Need an account? Sign up
          </NavLink>
        </div>

        <div className="bg-white py-8 px-6 shadow-elevation rounded-2xl border border-slate-200/80 sm:px-10">
          {hasAutoFilled && email && (
            <div className="mb-4 p-2.5 rounded-xl bg-teal-50 border border-teal-200/70 flex items-center justify-between text-xs text-teal-800">
              <div className="flex items-center gap-1.5 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span className="truncate">Saved login information loaded</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('');
                  setPassword('');
                  setHasAutoFilled(false);
                  localStorage.removeItem('skillsync_saved_email');
                  localStorage.removeItem('skillsync_saved_password');
                }}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline ml-2 flex-shrink-0"
              >
                Clear
              </button>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <Input
              label="College Email Address"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@university.edu"
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <NavLink
                  to="/forgot-password"
                  className="text-xs font-medium text-teal-600 hover:text-teal-700"
                >
                  Forgot password?
                </NavLink>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span>Remember login info</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Log In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <NavLink to="/register" className="font-semibold text-teal-600 hover:text-teal-700">
              Sign up here
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
