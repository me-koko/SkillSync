import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Filter } from 'lucide-react';
import { groupService } from '../services/groupService';
import { StudyGroup } from '../types';
import { GroupCard } from '../components/groups/GroupCard';
import { CreateGroupModal } from '../components/groups/CreateGroupModal';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('ALL');
  const [tab, setTab] = useState<'all' | 'my_groups'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await groupService.getGroups({
        search: search.trim() || undefined,
        topic: topicFilter !== 'ALL' ? topicFilter : undefined,
        filter: tab === 'my_groups' ? 'my_groups' : undefined,
      });
      setGroups(data);
    } catch (err) {
      console.error('Failed to load study groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGroups();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, topicFilter, tab]);

  const handleCreateGroup = async (data: any) => {
    await groupService.createGroup(data);
    fetchGroups();
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      setJoiningId(groupId);
      await groupService.joinGroup(groupId);
      fetchGroups();
    } catch (err) {
      console.error('Failed to join group:', err);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-600" />
            <span>Campus Study Groups</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Join public or private subject circles for shared problem sets, notes, and study schedules.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} size="sm" leftIcon={<Plus className="w-4 h-4" />}>
          Create Study Group
        </Button>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
          <button
            onClick={() => setTab('all')}
            className={`pb-2.5 transition-colors ${
              tab === 'all'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Campus Groups
          </button>
          <button
            onClick={() => setTab('my_groups')}
            className={`pb-2.5 transition-colors ${
              tab === 'my_groups'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            My Study Groups
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl py-1.5 px-2.5 text-slate-700"
          >
            <option value="ALL">All Subjects</option>
            <option value="Algorithms">Algorithms & DSA</option>
            <option value="Web">Web Development</option>
            <option value="Languages">Languages</option>
            <option value="Design">Design & UI/UX</option>
          </select>
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <LoadingSpinner fullHeight message="Loading study groups..." />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Groups Found"
          description="Be the first to start a collaborative study circle for your course or topic!"
          actionLabel="Create Study Group"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onJoin={handleJoinGroup}
              isJoining={joiningId === group.id}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateGroup}
      />
    </div>
  );
};
