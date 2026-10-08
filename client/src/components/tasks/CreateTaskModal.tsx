import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input, Textarea, Select } from '../common/Input';
import { Button } from '../common/Button';
import { TaskPriority, TaskStatus } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId?: string;
  roomId?: string;
  assignees?: Array<{ id: string; fullName: string }>;
  onSubmit: (data: {
    title: string;
    description?: string;
    dueDate?: string;
    priority: TaskPriority;
    status: TaskStatus;
    assigneeId?: string;
    groupId?: string;
    roomId?: string;
  }) => Promise<void>;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  groupId,
  roomId,
  assignees = [],
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        priority,
        status: 'TODO',
        assigneeId: assigneeId || undefined,
        groupId,
        roomId,
      });
      onClose();
      setTitle('');
      setDescription('');
      setDueDate('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Study Task"
      subtitle="Keep track of learning milestones, problem sets, and reading"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        <Input
          label="Task Title"
          placeholder="e.g. Solve LeetCode #200, Read Chapter 4 of Genki"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Details & Acceptance Criteria"
          placeholder="Optional notes or instructions..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <Select
            label="Priority Level"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            options={[
              { label: 'Medium Priority', value: 'MEDIUM' },
              { label: 'High Priority', value: 'HIGH' },
              { label: 'Low Priority', value: 'LOW' },
            ]}
          />
        </div>

        {assignees.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Assign to Member
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="">Unassigned (Open task)</option>
              {assignees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Add Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};
