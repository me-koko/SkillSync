import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Lock, Globe, CheckCircle2, ArrowRight } from 'lucide-react';
import { StudyGroup } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface GroupCardProps {
  group: StudyGroup;
  onJoin?: (groupId: string) => Promise<void>;
  isJoining?: boolean;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, onJoin, isJoining }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card hover:shadow-elevation transition-all p-5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {group.name[0]}
            </div>
            <div>
              <h4
                onClick={() => navigate(`/groups/${group.id}`)}
                className="font-semibold text-slate-900 hover:text-teal-600 transition-colors cursor-pointer text-base leading-tight"
              >
                {group.name}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">by {group.creator.fullName}</p>
            </div>
          </div>

          <Badge variant={group.isPrivate ? 'amber' : 'teal'} size="sm">
            {group.isPrivate ? (
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> Private
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> Public
              </span>
            )}
          </Badge>
        </div>

        {/* Topic Badge */}
        <div className="mb-3">
          <Badge variant="blue" size="sm">
            {group.topic}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
          {group.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{group.members?.length || group._count?.members || 0} members</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>{group.tasks?.length || group._count?.tasks || 0} tasks</span>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => navigate(`/groups/${group.id}`)}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          View Group
        </Button>

        {group.isMember ? (
          <span className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Member
          </span>
        ) : onJoin ? (
          <Button
            variant="primary"
            size="sm"
            isLoading={isJoining}
            onClick={() => onJoin(group.id)}
          >
            Join
          </Button>
        ) : null}
      </div>
    </div>
  );
};
