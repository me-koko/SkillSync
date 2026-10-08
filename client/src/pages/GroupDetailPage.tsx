import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CheckSquare,
  FileText,
  MessageSquare,
  Plus,
  Shield,
  Trash2,
  Lock,
  Globe,
  Link as LinkIcon,
  UploadCloud,
} from 'lucide-react';
import { groupService } from '../services/groupService';
import { taskService } from '../services/taskService';
import { resourceService } from '../services/resourceService';
import { chatService } from '../services/chatService';
import { StudyGroup, Task, Resource, Message, GroupRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ChatWindow } from '../components/chat/ChatWindow';
import { TaskItem } from '../components/tasks/TaskItem';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';

export const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'discussion' | 'tasks' | 'resources' | 'members'>('discussion');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const fetchGroupDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await groupService.getGroupById(id);
      setGroup(data);
      setTasks(data.tasks || []);
      setResources(data.resources || []);
      setMessages(data.messages || []);
    } catch (err: any) {
      console.error('Failed to load group:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  // Join group channel for real-time discussion
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('group:join', id);

    socket.on('group:message', (newMsg: Message) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    socket.on('group:task_updated', (data: { task?: Task; taskId?: string; action: string }) => {
      if (data.action === 'create' && data.task) {
        setTasks((prev) => [data.task!, ...prev]);
      } else if (data.action === 'update' && data.task) {
        setTasks((prev) => prev.map((t) => (t.id === data.task!.id ? data.task! : t)));
      }
    });

    return () => {
      socket.emit('group:leave', id);
      socket.off('group:message');
      socket.off('group:task_updated');
    };
  }, [socket, id]);

  const handleSendMessage = async (content: string) => {
    if (!id) return;
    await chatService.sendMessage({ content, groupId: id });
  };

  const handleCreateTask = async (taskData: any) => {
    await taskService.createTask(taskData);
    const updatedTasks = await taskService.getTasks({ groupId: id });
    setTasks(updatedTasks);
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: any) => {
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

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !linkName.trim() || !linkUrl.trim()) return;

    await resourceService.createLinkResource({
      name: linkName.trim(),
      url: linkUrl.trim(),
      groupId: id,
    });
    setLinkName('');
    setLinkUrl('');
    setIsLinkModalOpen(false);
    const res = await resourceService.getResources({ groupId: id });
    setResources(res);
  };

  const handleLeaveGroup = async () => {
    if (!id) return;
    if (confirm('Are you sure you want to leave this study group?')) {
      await groupService.leaveGroup(id);
      navigate('/groups');
    }
  };

  const handleRoleChange = async (targetUserId: string, role: GroupRole) => {
    if (!id) return;
    await groupService.updateRole(id, targetUserId, role);
    fetchGroupDetails();
  };

  if (loading) {
    return <LoadingSpinner fullHeight message="Entering group workspace..." />;
  }

  if (!group) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-600">Study group not found or you do not have permission to view it.</p>
        <Button onClick={() => navigate('/groups')} size="sm" className="mt-4">
          Back to Groups
        </Button>
      </div>
    );
  }

  const myMembership = group.members?.find((m) => m.userId === user?.id);
  const isOwner = myMembership?.role === 'OWNER';
  const isModOrOwner = isOwner || myMembership?.role === 'MODERATOR';

  return (
    <div className="space-y-6 pb-12">
      {/* Group Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
              {group.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
                <Badge variant={group.isPrivate ? 'amber' : 'teal'} size="sm">
                  {group.isPrivate ? 'Private' : 'Public'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {group.topic} • Created by {group.creator?.fullName}
              </p>
              <p className="text-xs text-slate-600 mt-2 max-w-2xl">{group.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {myMembership ? (
              myMembership.role !== 'OWNER' && (
                <Button variant="outline" size="sm" onClick={handleLeaveGroup}>
                  Leave Group
                </Button>
              )
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  await groupService.joinGroup(group.id);
                  fetchGroupDetails();
                }}
              >
                Join Group
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-6 mt-8 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('discussion')}
            className={`pb-3 flex items-center gap-1.5 transition-colors ${
              activeTab === 'discussion'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Discussion Board</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-3 flex items-center gap-1.5 transition-colors ${
              activeTab === 'tasks'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Group Tasks ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-3 flex items-center gap-1.5 transition-colors ${
              activeTab === 'resources'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Shared Resources ({resources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 flex items-center gap-1.5 transition-colors ${
              activeTab === 'members'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Members ({group.members?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Discussion Board */}
      {activeTab === 'discussion' && (
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          channelTitle={`${group.name} Discussion`}
          channelSubtitle={`${group.members?.length || 0} participants`}
          groupId={group.id}
        />
      )}

      {/* Tab 2: Group Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Study Milestones & Tasks</h3>
            <Button
              size="sm"
              onClick={() => setIsTaskModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Group Task
            </Button>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              No tasks assigned yet. Add a problem set or reading goal for the group!
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleStatus={handleToggleTaskStatus}
                  onDelete={isModOrOwner ? handleDeleteTask : undefined}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Shared Resources */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Study Material & Links</h3>
            <Button
              size="sm"
              onClick={() => setIsLinkModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Link Resource
            </Button>
          </div>

          {resources.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              No resources uploaded yet. Share useful documentation, PDFs, or lecture notes.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((res) => (
                <div key={res.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-teal-600 mb-2">
                      <LinkIcon className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{res.type}</span>
                    </div>
                    <h5 className="font-semibold text-sm text-slate-900 mb-1">{res.name}</h5>
                    <p className="text-[11px] text-slate-500 truncate">Shared by {res.uploader.fullName}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-teal-600 hover:underline"
                    >
                      Open Resource ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Members Roster */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card divide-y divide-slate-100">
          {group.members?.map((m) => (
            <div key={m.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar src={m.user.avatarUrl} name={m.user.fullName} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-semibold text-sm text-slate-900">{m.user.fullName}</h5>
                    <Badge
                      variant={m.role === 'OWNER' ? 'teal' : m.role === 'MODERATOR' ? 'indigo' : 'gray'}
                      size="sm"
                    >
                      {m.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{m.user.college}</p>
                </div>
              </div>

              {/* Owner Role Management */}
              {isOwner && m.userId !== user?.id && (
                <div className="flex items-center gap-2">
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.userId, e.target.value as GroupRole)}
                    className="text-xs border border-slate-300 rounded-lg p-1 bg-white"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="MODERATOR">Moderator</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        groupId={group.id}
        assignees={group.members?.map((m) => ({ id: m.userId, fullName: m.user.fullName }))}
        onSubmit={handleCreateTask}
      />

      {/* Add Link Resource Modal */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="Add Link Resource"
        subtitle="Share documentation, practice websites, or slides"
        maxWidth="sm"
      >
        <form onSubmit={handleAddLink} className="space-y-4">
          <Input
            label="Resource Name"
            placeholder="e.g. Graph Traversal Cheatsheet"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            required
          />
          <Input
            label="URL"
            type="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            required
          />
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Resource
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
