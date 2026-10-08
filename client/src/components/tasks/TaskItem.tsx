import React from 'react';
import { CheckSquare, Square, Calendar, User, Trash2 } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { Badge } from '../common/Badge';

interface TaskItemProps {
  task: Task;
  onToggleStatus: (id: string, currentStatus: TaskStatus) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const priorityBadges: Record<TaskPriority, { label: string; variant: 'rose' | 'amber' | 'teal' }> = {
  HIGH: { label: 'High', variant: 'rose' },
  MEDIUM: { label: 'Medium', variant: 'amber' },
  LOW: { label: 'Low', variant: 'teal' },
};

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleStatus, onDelete }) => {
  const isCompleted = task.status === 'COMPLETED';
  const priorityConfig = priorityBadges[task.priority] || { label: task.priority, variant: 'teal' };

  return (
    <div
      className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
        isCompleted
          ? 'bg-slate-50/70 border-slate-200/80 opacity-75'
          : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <button
          onClick={() => onToggleStatus(task.id, task.status)}
          className="mt-0.5 text-slate-400 hover:text-teal-600 transition-colors flex-shrink-0"
        >
          {isCompleted ? (
            <CheckSquare className="w-5 h-5 text-teal-600 fill-teal-50" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h5
            className={`text-sm font-medium leading-snug break-words ${
              isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
            }`}
          >
            {task.title}
          </h5>

          {task.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-[11px] text-slate-500">
            <Badge variant={priorityConfig.variant} size="sm">
              {priorityConfig.label}
            </Badge>

            {task.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </span>
            )}

            {task.assignee && (
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <User className="w-3 h-3 text-slate-400" />
                <span>{task.assignee.fullName}</span>
              </span>
            )}

            {task.group && (
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                {task.group.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {onDelete && (
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors flex-shrink-0"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
