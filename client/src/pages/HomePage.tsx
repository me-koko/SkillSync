import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Users,
  BookOpen,
  Calendar,
  CheckSquare,
  MessageSquare,
  Bell,
  ArrowRight,
  Plus,
  Repeat,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { discoverService } from '../services/discoverService';
import { groupService } from '../services/groupService';
import { connectionService } from '../services/connectionService';
import { taskService } from '../services/taskService';
import { chatService } from '../services/chatService';
import { notificationService } from '../services/notificationService';
import { exchangeService } from '../services/exchangeService';

import {
  DiscoverUser,
  StudyGroup,
  Task,
  Notification,
  SkillExchange,
} from '../types';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { UserCard } from '../components/discover/UserCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [matches, setMatches] = useState<DiscoverUser[]>([]);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [pendingIncoming, setPendingIncoming] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeExchanges, setActiveExchanges] = useState<SkillExchange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          matchesRes,
          groupsRes,
          connectionsRes,
          tasksRes,
          convosRes,
          notifsRes,
          exchangesRes,
        ] = await Promise.allSettled([
          discoverService.getTopMatches(),
          groupService.getGroups({ filter: 'my_groups' }),
          connectionService.getConnections(),
          taskService.getTasks({ status: 'TODO' }),
          chatService.getConversations(),
          notificationService.getNotifications(),
          exchangeService.getExchanges(),
        ]);

        if (matchesRes.status === 'fulfilled') setMatches(matchesRes.value);
        if (groupsRes.status === 'fulfilled') setGroups(groupsRes.value);
        if (connectionsRes.status === 'fulfilled') {
          setPendingIncoming(connectionsRes.value.incoming);
        }
        if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value);
        if (convosRes.status === 'fulfilled') setRecentConversations(convosRes.value);
        if (notifsRes.status === 'fulfilled') setNotifications(notifsRes.value.notifications);
        if (exchangesRes.status === 'fulfilled') {
          setActiveExchanges(exchangesRes.value.filter((e) => e.status === 'ACTIVE'));
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleConnect = async (userId: string) => {
    await connectionService.sendRequest(userId);
    setMatches((prev) =>
      prev.map((m) =>
        m.id === userId
          ? {
              ...m,
              connection: { id: 'temp', status: 'PENDING', isSender: true },
            }
          : m
      )
    );
  };

  const handleRespondConnection = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    await connectionService.respondRequest(id, status);
    setPendingIncoming((prev) => prev.filter((p) => p.id !== id));
  };

  const handleToggleTask = async (taskId: string, currentStatus: any) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    await taskService.updateTask(taskId, { status: nextStatus });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  if (loading) {
    return <LoadingSpinner fullHeight message="Curating your learning feed..." />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Welcome Header Banner */}
      <section className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-elevation flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-600/40 border border-teal-500/40 text-xs font-semibold text-teal-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome Back, {user?.fullName.split(' ')[0]}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to learn and collaborate today?
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            {user?.college} • {user?.course} ({user?.yearOfStudy})
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button
            onClick={() => navigate('/discover')}
            size="sm"
            className="bg-white text-teal-900 hover:bg-teal-50 font-semibold shadow-xs"
            leftIcon={<Search className="w-4 h-4 text-teal-700" />}
          >
            Find Peers
          </Button>
          <Button
            onClick={() => navigate('/groups')}
            variant="outline"
            size="sm"
            className="border-teal-400 text-white hover:bg-white/10"
            leftIcon={<BookOpen className="w-4 h-4" />}
          >
            Explore Groups
          </Button>
        </div>
      </section>

      {/* 2. Pending Connection Requests Alert Bar (if any) */}
      {pendingIncoming.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Users className="w-4 h-4 text-amber-700" />
              <span>Pending Connection Requests ({pendingIncoming.length})</span>
            </div>
            <NavLink to="/connections" className="text-xs font-semibold text-amber-800 hover:underline">
              View all
            </NavLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingIncoming.map((req) => (
              <div
                key={req.id}
                className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-2 shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar src={req.sender.avatarUrl} name={req.sender.fullName} size="sm" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">{req.sender.fullName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{req.sender.college}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Button
                    size="sm"
                    className="py-1 px-2.5 text-xs"
                    onClick={() => handleRespondConnection(req.id, 'ACCEPTED')}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="py-1 px-2 text-xs text-slate-400"
                    onClick={() => handleRespondConnection(req.id, 'REJECTED')}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Suggested Skill Matches */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Suggested Skill Matches</h2>
            <p className="text-xs text-slate-500">
              Ranked by reciprocal skill exchange compatibility and free schedule
            </p>
          </div>
          <NavLink
            to="/discover"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        {matches.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No compatible matches found yet. Try adding more skills you want to learn in your profile!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {matches.slice(0, 3).map((student) => (
              <UserCard
                key={student.id}
                student={student}
                onConnect={handleConnect}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Active Exchanges & Study Sessions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>Active Skill Exchanges & Schedule</span>
          </div>
          <NavLink to="/exchanges" className="text-xs font-semibold text-teal-600 hover:underline">
            View agreements
          </NavLink>
        </div>

        {activeExchanges.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No active skill exchange agreements yet. Propose an exchange with one of your connections!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeExchanges.map((ex) => {
              const isInitiator = ex.initiatorId === user?.id;
              const partner = isInitiator ? ex.partner : ex.initiator;
              const teach = isInitiator ? ex.teachSkill : ex.learnSkill;
              const learn = isInitiator ? ex.learnSkill : ex.teachSkill;

              return (
                <div
                  key={ex.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={partner.avatarUrl} name={partner.fullName} size="sm" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{partner.fullName}</h5>
                      <p className="text-[11px] text-slate-500">
                        Teach <span className="font-semibold text-teal-700">{teach}</span> ↔ Learn{' '}
                        <span className="font-semibold text-blue-700">{learn}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-slate-700 block">
                      {ex.schedule}
                    </span>
                    <span className="text-[10px] text-teal-600 font-medium capitalize">
                      {ex.format}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Study Groups & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Study Groups */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>Your Study Groups</span>
            </div>
            <NavLink to="/groups" className="text-xs font-semibold text-teal-600 hover:underline">
              Explore groups
            </NavLink>
          </div>

          {groups.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              You have not joined any study groups yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {groups.slice(0, 4).map((g) => (
                <div
                  key={g.id}
                  onClick={() => navigate(`/groups/${g.id}`)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-teal-300 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                      {g.name[0]}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{g.name}</h5>
                      <p className="text-[11px] text-slate-500">{g.topic}</p>
                    </div>
                  </div>
                  <Badge variant="gray" size="sm">
                    {g.members?.length || 0} members
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <CheckSquare className="w-4 h-4 text-teal-600" />
              <span>Study Tasks (To Do)</span>
            </div>
            <NavLink to="/tasks" className="text-xs font-semibold text-teal-600 hover:underline">
              All tasks
            </NavLink>
          </div>

          {tasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              All tasks completed! Have a relaxing study break.
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.status === 'COMPLETED'}
                      onChange={() => handleToggleTask(task.id, task.status)}
                      className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-800 truncate">
                      {task.title}
                    </span>
                  </div>
                  <Badge
                    variant={task.priority === 'HIGH' ? 'rose' : task.priority === 'MEDIUM' ? 'amber' : 'teal'}
                    size="sm"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. Recent Messages & Notifications Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              <span>Recent Messages</span>
            </div>
            <NavLink to="/messages" className="text-xs font-semibold text-teal-600 hover:underline">
              Open chat
            </NavLink>
          </div>

          {recentConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No recent message threads.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentConversations.slice(0, 3).map((convo) => (
                <div
                  key={convo.peer.id}
                  onClick={() => navigate(`/messages/${convo.peer.id}`)}
                  className="py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar src={convo.peer.avatarUrl} name={convo.peer.fullName} size="sm" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {convo.peer.fullName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {convo.lastMessage ? convo.lastMessage.content : 'No messages'}
                      </p>
                    </div>
                  </div>
                  {convo.unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold">
                      {convo.unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Bell className="w-4 h-4 text-teal-600" />
              <span>Recent Activity & Alerts</span>
            </div>
            <NavLink to="/notifications" className="text-xs font-semibold text-teal-600 hover:underline">
              View all
            </NavLink>
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No new notifications.
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notif) => (
                <div
                  key={notif.id}
                  className={`p-2.5 rounded-xl border text-xs ${
                    notif.isRead ? 'bg-slate-50 border-slate-200' : 'bg-teal-50/60 border-teal-200'
                  }`}
                >
                  <p className="font-semibold text-slate-900">{notif.title}</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">{notif.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
