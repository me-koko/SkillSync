import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, Menu, X, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';

export const RootLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleGoHome = () => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" onClick={handleGoHome} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">SkillSync</span>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={handleGoHome}
              className={`hover:text-teal-700 transition-colors ${
                location.pathname === '/' ? 'text-teal-700 font-semibold' : ''
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-teal-700 transition-colors"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="hover:text-teal-700 transition-colors"
            >
              Features
            </button>
          </nav>

          {/* Actions & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate('/home')} size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'text-teal-700 bg-teal-50 font-semibold'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  Log In
                </NavLink>
                <Button onClick={() => navigate('/register')} size="sm">
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-1">
              <button
                type="button"
                onClick={handleGoHome}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50 hover:text-teal-700"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50 hover:text-teal-700"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('features')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50 hover:text-teal-700"
              >
                Features
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/home');
                  }}
                  size="sm"
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                  >
                    Log In
                  </NavLink>
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/register');
                    }}
                    size="sm"
                    className="w-full"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>SkillSync</span>
              </div>
              <p className="text-sm text-slate-400">
                Peer-to-peer skill exchange and collaborative learning platform for college students.
              </p>
              <p className="text-xs text-slate-500">"Learn together. Teach what you know."</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={handleGoHome} className="hover:text-white transition-colors">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">
                    How It Works
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">
                    Features
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Account</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <NavLink to="/login" className="hover:text-white transition-colors">
                    Log In
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/register" className="hover:text-white transition-colors">
                    Sign Up
                  </NavLink>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">SkillSync Platform</h4>
              <p className="text-xs text-slate-400">
                Built with React, Vite, TypeScript, Tailwind CSS, Node.js, Express, PostgreSQL, Prisma & Socket.IO.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 SkillSync Platform. All rights reserved.</p>
            <p>Designed for college peer collaboration.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
