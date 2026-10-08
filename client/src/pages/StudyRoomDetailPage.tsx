import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Video,
  Users,
  CheckSquare,
  FileText,
  MessageSquare,
  Clock,
  Plus,
  ArrowLeft,
  Share2,
  Lock,
} from 'lucide-react';
import { roomService } from '../services/roomService';
import { taskService } from '../services/taskService';
import { chatService } from '../services/chatService';
import { connectionService } from '../services/connectionService';
import { StudyRoom, Task, Message, ConnectionRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { PomodoroTimer } from '../components/rooms/PomodoroTimer';
import { SharedNotes } from '../components/rooms/SharedNotes';
import { ChatWindow } from '../components/chat/ChatWindow';
import { TaskItem } from '../components/tasks/TaskItem';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const StudyRoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket, isOnline } = useSocket();
  const navigate = useNavigate();

  const [room, setRoom] = useState<StudyRoom | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [connections, setConnections] = useState<ConnectionRecord[]>([]);

  const fetchRoom = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await roomService.getRoomById(id);
      setRoom(data);
      setTasks(data.tasks || []);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load study room:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
    // Preload connections for inviting
    connectionService
      .getConnections()
      .then((res) => setConnections(res.current))
      .catch(() => {});
  }, [id]);

  // Socket.IO Room Lifecycle
  useEffect(() => {
    if (!socket || !id) return;

    // Join room channel
    socket.emit('room:join', id);

    socket.on('room:message', (newMsg: Message) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    socket.on('room:task_updated', (data: { task?: Task; taskId?: string; action: string }) => {
      if (data.action === 'create' && data.task) {
        setTasks((prev) => [data.task!, ...prev]);
      } else if (data.action === 'update' && data.task) {
        setTasks((prev) => prev.map((t) => (t.id === data.task!.id ? data.task! : t)));
      } else if (data.action === 'delete' && data.taskId) {
        setTasks((prev) => prev.filter((t) => t.id !== data.taskId));
      }
    });

    return () => {
      socket.emit('room:leave', id);
      socket.off('room:message');
      socket.off('room:task_updated');
    };
  }, [socket, id]);

  const handleSendMessage = async (content: string) => {
    if (!id) return;
    await chatService.sendMessage({ content, roomId: id });
  };

  const handleCreateTask = async (taskData: any) => {
    await taskService.createTask(taskData);
    const updated = await taskService.getTasks({ roomId: id });
    setTasks(updated);
  };

  const handleToggleTask = async (taskId: string, currentStatus: any) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    await taskService.updateTask(taskId, { status: nextStatus });
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );
  };

  const handleDeleteTask = async (taskId: string) => {
    await taskService.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  if (loading) {
    return <LoadingSpinner fullHeight message="Connecting to live collaborative room..." />;
  }

  if (!room) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-600">Study room not found.</p>
        <Button onClick={() => navigate('/study-rooms')} size="sm" className="mt-4">
          Back to Rooms
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/study-rooms')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{room.name}</h1>
              <Badge variant={room.isPrivate ? 'amber' : 'teal'} size="sm">
                {room.isPrivate ? 'Private' : 'Live Room'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Topic: <span className="text-teal-700 font-semibold">{room.topic}</span> • Hosted by{' '}
              {room.creator?.fullName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInviteModalOpen(true)}
            leftIcon={<Share2 className="w-3.5 h-3.5" />}
          >
            Invite Connections
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/study-rooms')}
          >
            Leave Room
          </Button>
        </div>
      </div>

      {/* Main Workspace 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pomodoro Timer, Shared Notes, and Task Checklist */}
        <div className="lg:col-span-7 space-y-6">
          {/* Synchronized Pomodoro Timer */}
          <PomodoroTimer
            roomId={room.id}
            initialSeconds={room.activeTimer}
            isInitialRunning={room.isTimerOn}
          />

          {/* Collaborative Live Shared Notes */}
          <SharedNotes
            roomId={room.id}
            initialNotes={room.sharedNotes}
          />

          {/* Room Task Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <CheckSquare className="w-4 h-4 text-teal-600" />
                <span>Room Study Checklist ({tasks.length})</span>
              </div>
              <Button
                size="sm"
                onClick={() => setIsTaskModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Goal
              </Button>
            </div>

            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 italic">
                No tasks set for this session yet. Add 1-2 goals to accomplish!
              </p>
            ) : (
              <div className="space-y-2.5">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleStatus={handleToggleTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Participants Roster & Real-time Room Chat */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Participants Roster */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <Users className="w-4 h-4 text-teal-600" />
                <span>Study Room Participants</span>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                {room.members?.length || 1} Active
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {room.members?.map((m) => {
                const online = isOnline(m.userId) || m.userId === user?.id;
                return (
                  <div key={m.id} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        src={m.user?.avatarUrl}
                        name={m.user?.fullName || 'User'}
                        size="sm"
                        isOnline={online}
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {m.user?.fullName} {m.userId === user?.id && '(You)'}
                        </p>
                        <p className="text-[10px] text-slate-400">{m.user?.college}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500">
                      {online ? 'Focusing' : 'Away'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Room Chat */}
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            channelTitle={`${room.name} Live Chat`}
            channelSubtitle="Synchronized room communication"
            roomId={room.id}
          />
        </div>
      </div>

      {/* Add Task Modal */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        roomId={room.id}
        assignees={room.members?.map((m) => ({ id: m.userId, fullName: m.user.fullName }))}
        onSubmit={handleCreateTask}
      />

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Connections"
        subtitle="Bring peers into this live collaborative session"
        maxWidth="sm"
      >
        <div className="space-y-3">
          {connections.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              You do not have any accepted connections yet.
            </p>
          ) : (
            connections.map((c) => (
              <div key={c.peer.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  <Avatar src={c.peer.avatarUrl} name={c.peer.fullName} size="sm" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{c.peer.fullName}</p>
                    <p className="text-[10px] text-slate-500">{c.peer.college}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    alert(`Invitation link shared with ${c.peer.fullName}!`);
                    setIsInviteModalOpen(false);
                  }}
                >
                  Invite
                </Button>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};
