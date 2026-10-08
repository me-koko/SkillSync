import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  UserPlus,
  Check,
  Clock,
  MapPin,
  GraduationCap,
  Calendar,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { DiscoverUser } from '../../types';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface UserCardProps {
  student: DiscoverUser;
  onConnect: (userId: string) => Promise<void>;
  isConnecting?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  student,
  onConnect,
  isConnecting = false,
}) => {
  const navigate = useNavigate();
  const [showMatchModal, setShowMatchModal] = useState(false);

  const teachSkills = student.skills.filter((s) => s.type === 'TEACH');
  const learnSkills = student.skills.filter((s) => s.type === 'LEARN');
  const score = student.compatibility?.score ?? 0;

  // Compatibility score styling
  const scoreBadgeColor =
    score >= 70
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : score >= 40
      ? 'bg-teal-50 text-teal-700 border-teal-200'
      : 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card hover:shadow-elevation transition-all p-5 flex flex-col justify-between">
        <div>
          {/* Header with Avatar, Details and Match Badge */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-start gap-3">
              <Avatar
                src={student.avatarUrl}
                name={student.fullName}
                size="lg"
              />
              <div>
                <h4
                  onClick={() => navigate(`/profile/${student.id}`)}
                  className="font-semibold text-slate-900 hover:text-teal-600 transition-colors cursor-pointer text-base leading-tight"
                >
                  {student.fullName}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">
                    {student.college} • {student.yearOfStudy}
                  </span>
                </div>
                {student.headline && (
                  <p className="text-xs text-slate-600 mt-1 font-medium line-clamp-1">
                    {student.headline}
                  </p>
                )}
              </div>
            </div>

            {/* Compatibility Badge */}
            <button
              onClick={() => setShowMatchModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold transition-transform hover:scale-105 ${scoreBadgeColor}`}
              title="Click to view transparent match explanation"
            >
              <Sparkles className="w-3 h-3" />
              <span>{score}% Match</span>
            </button>
          </div>

          {/* Quick Match Reason Highlight */}
          {student.compatibility?.reasons?.[0] && (
            <div
              onClick={() => setShowMatchModal(true)}
              className="mb-4 bg-teal-50/70 border border-teal-100 rounded-xl px-3 py-2 text-xs text-teal-800 flex items-center justify-between cursor-pointer hover:bg-teal-50 transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                <span className="truncate">{student.compatibility.reasons[0]}</span>
              </div>
              <Info className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 ml-1" />
            </div>
          )}

          {/* Bio snippet */}
          {student.bio && (
            <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
              {student.bio}
            </p>
          )}

          {/* Skills Grid */}
          <div className="space-y-3 mb-5">
            {/* Teaches */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Can Teach
              </span>
              <div className="flex flex-wrap gap-1.5">
                {teachSkills.length > 0 ? (
                  teachSkills.slice(0, 3).map((s) => (
                    <Badge key={s.id} variant="teal" size="sm">
                      {s.skill.name} • {s.level.slice(0, 3)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">None listed yet</span>
                )}
                {teachSkills.length > 3 && (
                  <Badge variant="gray" size="sm">+{teachSkills.length - 3}</Badge>
                )}
              </div>
            </div>

            {/* Wants to Learn */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Wants to Learn
              </span>
              <div className="flex flex-wrap gap-1.5">
                {learnSkills.length > 0 ? (
                  learnSkills.slice(0, 3).map((s) => (
                    <Badge key={s.id} variant="blue" size="sm">
                      {s.skill.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">None listed yet</span>
                )}
                {learnSkills.length > 3 && (
                  <Badge variant="gray" size="sm">+{learnSkills.length - 3}</Badge>
                )}
              </div>
            </div>

            {/* Availability */}
            {student.availabilities?.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">
                  {student.availabilities.slice(0, 2).map((a) => `${a.dayOfWeek} ${a.timeSlot}`).join(', ')}
                  {student.availabilities.length > 2 && ` (+${student.availabilities.length - 2} more)`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/profile/${student.id}`)}
          >
            View Profile
          </Button>

          {student.connection ? (
            student.connection.status === 'ACCEPTED' ? (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-emerald-700 bg-emerald-50 border-emerald-200"
                onClick={() => navigate('/messages')}
                leftIcon={<Check className="w-3.5 h-3.5" />}
              >
                Connected
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="flex-1 bg-slate-50 text-slate-400"
              >
                Pending
              </Button>
            )
          ) : (
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              isLoading={isConnecting}
              onClick={() => onConnect(student.id)}
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            >
              Connect
            </Button>
          )}
        </div>
      </div>

      {/* Compatibility Modal */}
      <Modal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        title="Compatibility Breakdown"
        subtitle={`Why you and ${student.fullName} are a ${score}% match`}
      >
        <div className="space-y-4">
          <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-teal-800 uppercase tracking-wider">Overall Match</p>
              <p className="text-2xl font-black text-teal-700">{score}% Compatibility</p>
            </div>
            <Sparkles className="w-8 h-8 text-teal-600 opacity-80" />
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Transparent Match Factors:
            </h5>
            <div className="space-y-2">
              {student.compatibility?.reasons?.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {student.compatibility?.sharedInterests?.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Shared Interests
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {student.compatibility.sharedInterests.map((interest, idx) => (
                  <Badge key={idx} variant="indigo" size="sm">{interest}</Badge>
                ))}
              </div>
            </div>
          )}

          {student.compatibility?.sharedAvailability?.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Overlapping Free Time
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {student.compatibility.sharedAvailability.map((slot, idx) => (
                  <Badge key={idx} variant="amber" size="sm">{slot}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button onClick={() => setShowMatchModal(false)} size="sm" variant="secondary">
              Close Breakdown
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
