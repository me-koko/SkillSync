import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { authService } from '../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setIsLoading(true);
      setError('');
      const msg = await authService.forgotPassword(email.trim());
      setMessage(msg);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request password reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-2xl font-bold text-slate-900 tracking-tight">
          Reset Password
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Enter your university email to receive recovery instructions
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
            to="/login"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            Back to Log in
          </NavLink>
        </div>

        <div className="bg-white py-8 px-6 shadow-elevation rounded-2xl border border-slate-200/80 sm:px-10">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Check Your Inbox</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
              <div className="pt-4 border-t border-slate-100">
                <NavLink
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </NavLink>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-xl">
                  {error}
                </div>
              )}

              <Input
                label="Registered College Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex@university.edu"
              />

              <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isLoading}>
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <NavLink
                  to="/login"
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                </NavLink>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
