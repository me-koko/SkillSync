import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from './Avatar';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu, unreadCount = 0 }) => {
  const { user } = useAuth();

  return (
    <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <NavLink to="/home" className="flex items-center gap-2 text-teal-700 font-bold text-lg">
          <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-slate-900">SkillSync</span>
        </NavLink>
      </div>

      <div className="flex items-center gap-2">
        <NavLink
          to="/notifications"
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
          )}
        </NavLink>

        <NavLink to="/profile">
          <Avatar src={user?.avatarUrl} name={user?.fullName || 'User'} size="sm" isOnline={true} />
        </NavLink>
      </div>
    </header>
  );
};
