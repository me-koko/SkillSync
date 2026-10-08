import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, X, Compass, Users } from 'lucide-react';
import { discoverService, DiscoverFilters } from '../services/discoverService';
import { connectionService } from '../services/connectionService';
import { userService } from '../services/userService';
import { DiscoverUser } from '../types';
import { UserCard } from '../components/discover/UserCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';

export const DiscoverPage: React.FC = () => {
  const [students, setStudents] = useState<DiscoverUser[]>([]);
  const [allSkills, setAllSkills] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Search and Filter State
  const [search, setSearch] = useState('');
  const [teachSkill, setTeachSkill] = useState('ALL');
  const [learnSkill, setLearnSkill] = useState('ALL');
  const [skillLevel, setSkillLevel] = useState('ALL');
  const [dayOfWeek, setDayOfWeek] = useState('ALL');
  const [learningFormat, setLearningFormat] = useState('ALL');
  const [college, setCollege] = useState('ALL');
  const [yearOfStudy, setYearOfStudy] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // Load skills list for dropdowns
  useEffect(() => {
    userService
      .getAllSkills()
      .then((data) => setAllSkills(data))
      .catch(() => {});
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const filters: DiscoverFilters = {
        search: search.trim() || undefined,
        teachSkill: teachSkill !== 'ALL' ? teachSkill : undefined,
        learnSkill: learnSkill !== 'ALL' ? learnSkill : undefined,
        skillLevel: skillLevel !== 'ALL' ? skillLevel : undefined,
        dayOfWeek: dayOfWeek !== 'ALL' ? dayOfWeek : undefined,
        learningFormat: learningFormat !== 'ALL' ? learningFormat : undefined,
        college: college !== 'ALL' ? college : undefined,
        yearOfStudy: yearOfStudy !== 'ALL' ? yearOfStudy : undefined,
      };

      const data = await discoverService.discover(filters);
      setStudents(data);
    } catch (err) {
      console.error('Failed to discover students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [
    search,
    teachSkill,
    learnSkill,
    skillLevel,
    dayOfWeek,
    learningFormat,
    college,
    yearOfStudy,
  ]);

  const handleConnect = async (userId: string) => {
    try {
      setConnectingId(userId);
      await connectionService.sendRequest(userId);
      setStudents((prev) =>
        prev.map((s) =>
          s.id === userId
            ? {
                ...s,
                connection: { id: 'pending-id', status: 'PENDING', isSender: true },
              }
            : s
        )
      );
    } catch (err) {
      console.error('Failed to send connection:', err);
    } finally {
      setConnectingId(null);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setTeachSkill('ALL');
    setLearnSkill('ALL');
    setSkillLevel('ALL');
    setDayOfWeek('ALL');
    setLearningFormat('ALL');
    setCollege('ALL');
    setYearOfStudy('ALL');
  };

  const activeFilterCount = [
    teachSkill !== 'ALL',
    learnSkill !== 'ALL',
    skillLevel !== 'ALL',
    dayOfWeek !== 'ALL',
    learningFormat !== 'ALL',
    college !== 'ALL',
    yearOfStudy !== 'ALL',
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-teal-600" />
            <span>Discover Peers & Study Partners</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent compatibility scores calculated from your shared skills, free hours, and learning style.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter className="w-4 h-4" />}
          >
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-slate-900 underline px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name, skills, major, interest, or university..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expandable Filter Tray */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Skills They Teach
            </label>
            <select
              value={teachSkill}
              onChange={(e) => setTeachSkill(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white"
            >
              <option value="ALL">All Teaching Skills</option>
              {allSkills.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Skills They Want To Learn
            </label>
            <select
              value={learnSkill}
              onChange={(e) => setLearnSkill(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white"
            >
              <option value="ALL">All Learning Skills</option>
              {allSkills.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Free Day of Week
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white"
            >
              <option value="ALL">Any Day</option>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                (d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Preferred Format
            </label>
            <select
              value={learningFormat}
              onChange={(e) => setLearningFormat(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white"
            >
              <option value="ALL">Any Format</option>
              <option value="One-on-one">One-on-one</option>
              <option value="Small group">Small group</option>
              <option value="Large group">Large group</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              University / College
            </label>
            <input
              type="text"
              value={college === 'ALL' ? '' : college}
              onChange={(e) => setCollege(e.target.value.trim() ? e.target.value : 'ALL')}
              placeholder="Search by college name..."
              className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Year of Study
            </label>
            <select
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white"
            >
              <option value="ALL">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {loading ? (
        <LoadingSpinner fullHeight message="Evaluating student compatibility scores..." />
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Students Found"
          description="Try broadening your search keywords or clearing some filters to find peers."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div>
          <p className="text-xs text-slate-500 mb-4 font-medium">
            Showing {students.length} compatible student{students.length !== 1 ? 's' : ''}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {students.map((student) => (
              <UserCard
                key={student.id}
                student={student}
                onConnect={handleConnect}
                isConnecting={connectingId === student.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
