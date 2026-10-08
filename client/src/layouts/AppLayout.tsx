import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { notificationService } from '../services/notificationService';
import { chatService } from '../services/chatService';

export const AppLayout: React.FC = () => {
  const { user, token, loading } = useAuth();
  const { latestNotification, latestMessage } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (!token) return;

    // Fetch initial unread counts
    notificationService
      .getNotifications()
      .then((data) => setUnreadNotifications(data.unreadCount))
      .catch(() => {});

    chatService
      .getConversations()
      .then((convos) => {
        const total = convos.reduce((sum, c) => sum + c.unreadCount, 0);
        setUnreadMessages(total);
      })
      .catch(() => {});
  }, [token, location.pathname]);

  // Reactive updates on incoming socket notifications
  useEffect(() => {
    if (latestNotification) {
      setUnreadNotifications((prev) => prev + 1);
    }
  }, [latestNotification]);

  // Reactive updates on incoming chat messages
  useEffect(() => {
    if (latestMessage && !location.pathname.startsWith('/messages')) {
      setUnreadMessages((prev) => prev + 1);
    }
  }, [latestMessage, location.pathname]);

  if (loading) {
    return <LoadingSpinner fullHeight message="Initializing SkillSync..." />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If user hasn't completed onboarding and is not already on /onboarding
  if (!user.isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Desktop Sidebar (Permanent) */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar
          unreadNotificationsCount={unreadNotifications}
          unreadMessagesCount={unreadMessages}
        />
      </div>

      {/* Mobile Drawer (Toggleable) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-2xl">
            <Sidebar
              onCloseMobile={() => setMobileMenuOpen(false)}
              unreadNotificationsCount={unreadNotifications}
              unreadMessagesCount={unreadMessages}
            />
          </div>
        </div>
      )}

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          unreadCount={unreadNotifications}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
