import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Users,
  Repeat,
  BookOpen,
  MessageSquare,
  CheckSquare,
  Bell,
  User,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from './Avatar';

interface SidebarProps {
  onCloseMobile?: () => void;
  unreadNotificationsCount?: number;
  unreadMessagesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onCloseMobile,
  unreadNotificationsCount = 0,
  unreadMessagesCount = 0,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', icon: Home, path: '/home' },
    { label: 'Discover', icon: Search, path: '/discover' },
    { label: 'Connections', icon: Users, path: '/connections' },
    { label: 'Skill Exchanges', icon: Repeat, path: '/exchanges' },
    { label: 'Study Groups', icon: BookOpen, path: '/groups' },
    {
      label: 'Messages',
      icon: MessageSquare,
      path: '/messages',
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    { label: 'Tasks', icon: CheckSquare, path: '/tasks' },
    {
      label: 'Notifications',
      icon: Bell,
      path: '/notifications',
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
    { label: 'My Profile', icon: User, path: '/profile' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <NavLink
          to="/home"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 text-teal-700 font-bold text-xl tracking-tight"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="leading-none text-slate-900 font-bold">SkillSync</span>
            <span className="text-[10px] text-teal-600 font-medium tracking-wide">STUDENT EXCHANGE</span>
          </div>
        </NavLink>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-teal-600 text-white">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Profile Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/70 shadow-xs mb-2">
          <Avatar src={user?.avatarUrl} name={user?.fullName || 'User'} size="sm" isOnline={true} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">{user?.fullName}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.college || 'Student'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1">
          <NavLink
            to="/settings"
            onClick={onCloseMobile}
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
