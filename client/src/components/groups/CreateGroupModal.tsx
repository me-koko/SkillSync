import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input, Textarea, Select } from '../common/Input';
import { Button } from '../common/Button';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    topic: string;
    isPrivate: boolean;
  }) => Promise<void>;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('Data Structures & Algorithms');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !topic.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        topic: topic.trim(),
        isPrivate,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create study group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Study Group"
      subtitle="Gather peers around a common subject, course, or exam"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        <Input
          label="Group Name"
          placeholder="e.g. DSA Grind, React Beginners, Japanese N5"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Subject / Topic"
          placeholder="e.g. Computer Science, Languages, Design"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />

        <Textarea
          label="Description & Learning Objectives"
          placeholder="Describe what the group focuses on, meeting frequency, and what peers can expect..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
        />

        <div className="pt-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
            />
            <span className="text-xs text-slate-700 font-medium">
              Make this group private (Invitation only)
            </span>
          </label>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  );
};
