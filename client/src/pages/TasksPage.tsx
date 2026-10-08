import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Filter } from 'lucide-react';
import { taskService } from '../services/taskService';
import { Task, TaskStatus, TaskPriority } from '../types';
import { TaskItem } from '../components/tasks/TaskItem';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeScope, setActiveScope] = useState<'all' | 'personal' | 'groups' | 'rooms'>('all');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks({
        scope: activeScope === 'personal' ? 'personal' : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });

      // Filter groups vs rooms on client if chosen
      let filtered = data;
      if (activeScope === 'groups') {
        filtered = data.filter((t) => t.groupId !== null);
      } else if (activeScope === 'rooms') {
        filtered = data.filter((t) => t.roomId !== null);
      }
      setTasks(filtered);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeScope, statusFilter]);

  const handleCreateTask = async (taskData: any) => {
    await taskService.createTask(taskData);
    fetchTasks();
  };

  const handleToggleStatus = async (taskId: string, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    await taskService.updateTask(taskId, { status: nextStatus });
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );
  };

  const handleDeleteTask = async (taskId: string) => {
    await taskService.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-teal-600" />
            <span>Study Tasks & Milestones</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize personal study goals, problem set deadlines, and shared group deliverables.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} size="sm" leftIcon={<Plus className="w-4 h-4" />}>
          New Task
        </Button>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'personal', label: 'Personal' },
            { id: 'groups', label: 'Study Groups' },
            { id: 'rooms', label: 'Study Rooms' },
          ].map((scope) => (
            <button
              key={scope.id}
              onClick={() => setActiveScope(scope.id as any)}
              className={`pb-2.5 transition-colors ${
                activeScope === scope.id
                  ? 'text-teal-700 border-b-2 border-teal-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {scope.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <LoadingSpinner fullHeight message="Loading tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No Tasks Found"
          description="Create your first study task or check off items as you learn!"
          actionLabel="Add Task"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};
