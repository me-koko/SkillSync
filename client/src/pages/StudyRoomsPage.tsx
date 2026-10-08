import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Plus, Users, Clock, ArrowRight, Play, Lock, Globe } from 'lucide-react';
import { roomService } from '../services/roomService';
import { StudyRoom } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input, Textarea } from '../components/common/Input';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const StudyRoomsPage: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New room form
  const [roomName, setRoomName] = useState('');
  const [roomTopic, setRoomTopic] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await roomService.getRooms({ search: search.trim() || undefined });
      setRooms(data);
    } catch (err) {
      console.error('Failed to load study rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [search]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !roomTopic.trim()) return;

    try {
      setIsSubmitting(true);
      const room = await roomService.createRoom({
        name: roomName.trim(),
        topic: roomTopic.trim(),
        isPrivate,
      });
      setIsCreateOpen(false);
      navigate(`/study-rooms/${room.id}`);
    } catch (err) {
      console.error('Failed to create room:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Video className="w-6 h-6 text-teal-600" />
            <span>Collaborative Study Rooms</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Focused virtual workspaces equipped with synced Pomodoro timers, collaborative notes, and shared checklists.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} size="sm" leftIcon={<Plus className="w-4 h-4" />}>
          Create Study Room
        </Button>
      </div>

      {/* Room Grid */}
      {loading ? (
        <LoadingSpinner fullHeight message="Loading active rooms..." />
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No Study Rooms Active"
          description="Create a live collaborative room for your next peer study session or Pomodoro block!"
          actionLabel="Create Room"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card hover:shadow-elevation transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{room.name}</h4>
                    <p className="text-xs text-teal-700 font-semibold mt-0.5">{room.topic}</p>
                  </div>
                  <Badge variant={room.isPrivate ? 'amber' : 'teal'} size="sm">
                    {room.isPrivate ? 'Private' : 'Public'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 mb-4">
                  Hosted by {room.creator?.fullName || 'Student'}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {room.members?.length || 0} participants
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    25m Pomodoro
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/study-rooms/${room.id}`)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Enter Room Workspace
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Room Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Study Room"
        subtitle="Start a virtual collaborative workspace with real-time tools"
        maxWidth="md"
      >
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <Input
            label="Room Name"
            placeholder="e.g. DSA Saturday Session, Deep Work Sprint"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
          />

          <Input
            label="Focus Topic"
            placeholder="e.g. Binary Search Trees & DFS traversal, React Performance"
            value={roomTopic}
            onChange={(e) => setRoomTopic(e.target.value)}
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
                Make this study room private (Invitation only)
              </span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Launch Room
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
