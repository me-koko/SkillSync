import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input, Textarea, Select } from '../common/Input';
import { Button } from '../common/Button';
import { ConnectionRecord } from '../../types';

interface CreateExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  connections: ConnectionRecord[];
  onSubmit: (data: {
    partnerId: string;
    teachSkill: string;
    learnSkill: string;
    schedule: string;
    format: string;
    notes?: string;
  }) => Promise<void>;
  preselectedPartnerId?: string;
}

export const CreateExchangeModal: React.FC<CreateExchangeModalProps> = ({
  isOpen,
  onClose,
  connections,
  onSubmit,
  preselectedPartnerId,
}) => {
  const [partnerId, setPartnerId] = useState(preselectedPartnerId || (connections[0]?.peer.id ?? ''));
  const [teachSkill, setTeachSkill] = useState('');
  const [learnSkill, setLearnSkill] = useState('');
  const [schedule, setSchedule] = useState('Saturdays, 5:00 PM – 6:00 PM');
  const [format, setFormat] = useState('Online');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId || !teachSkill.trim() || !learnSkill.trim() || !schedule.trim()) {
      setError('Please fill out all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit({
        partnerId,
        teachSkill: teachSkill.trim(),
        learnSkill: learnSkill.trim(),
        schedule: schedule.trim(),
        format,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create skill exchange proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Propose Skill Exchange"
      subtitle="Establish a structured learning agreement with a peer"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Peer Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Connected Student
          </label>
          <select
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            required
          >
            {connections.length === 0 ? (
              <option value="">No accepted connections available</option>
            ) : (
              connections.map((c) => (
                <option key={c.peer.id} value={c.peer.id}>
                  {c.peer.fullName} ({c.peer.college})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Skill You Will Teach"
            placeholder="e.g. React, C++, UI/UX"
            value={teachSkill}
            onChange={(e) => setTeachSkill(e.target.value)}
            required
          />
          <Input
            label="Skill You Want to Learn"
            placeholder="e.g. Python, Japanese, Guitar"
            value={learnSkill}
            onChange={(e) => setLearnSkill(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Proposed Schedule"
            placeholder="e.g. Sundays 4:00 – 5:00 PM"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            required
          />
          <Select
            label="Format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            options={[
              { label: 'Online (Video / Discord)', value: 'Online' },
              { label: 'In-person (Campus Library)', value: 'In-person' },
              { label: 'Hybrid', value: 'Hybrid' },
            ]}
          />
        </div>

        <Textarea
          label="Learning Goals & Notes"
          placeholder="e.g. 1 hour weekly sessions alternating teaching. Focus on practical projects."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={connections.length === 0}
          >
            Send Agreement Proposal
          </Button>
        </div>
      </form>
    </Modal>
  );
};
