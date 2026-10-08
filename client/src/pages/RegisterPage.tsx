import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Input, Select } from '../components/common/Input';
import { Button } from '../components/common/Button';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    college: '',
    course: '',
    yearOfStudy: '2nd Year',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(formData);
      // Save credentials for login auto-fill
      localStorage.setItem('skillsync_saved_email', formData.email.trim());
      localStorage.setItem('skillsync_saved_password', formData.password);
      localStorage.setItem('skillsync_remember_me', 'true');
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create student account');
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
          Join the SkillSync Community
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Peer-to-peer collaborative learning for college students
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
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
            state={{ email: formData.email, password: formData.password }}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            Already have an account? Log in
          </NavLink>
        </div>

        <div className="bg-white py-8 px-6 shadow-elevation rounded-2xl border border-slate-200/80 sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Maya Patel"
            />

            <Input
              label="College Email Address"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. maya@berkeley.edu"
            />

            <Input
              label="Password (min 6 characters)"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="College / University"
                name="college"
                required
                value={formData.college}
                onChange={handleChange}
                placeholder="e.g. UC Berkeley"
              />

              <Input
                label="Major / Course"
                name="course"
                required
                value={formData.course}
                onChange={handleChange}
                placeholder="e.g. Data Science"
              />
            </div>

            <Select
              label="Year of Study"
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleChange}
              options={[
                { label: '1st Year (Freshman)', value: '1st Year' },
                { label: '2nd Year (Sophomore)', value: '2nd Year' },
                { label: '3rd Year (Junior)', value: '3rd Year' },
                { label: '4th Year (Senior)', value: '4th Year' },
                { label: 'Graduate / Master’s', value: 'Graduate' },
              ]}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Onboarding
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <NavLink
              to="/login"
              state={{ email: formData.email, password: formData.password }}
              className="font-semibold text-teal-600 hover:text-teal-700"
            >
              Sign in
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
