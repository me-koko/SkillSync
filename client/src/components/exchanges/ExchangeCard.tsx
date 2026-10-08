import React from 'react';
import { Repeat, Calendar, Clock, Star, Play, Pause, CheckCircle, MessageSquare } from 'lucide-react';
import { SkillExchange } from '../../types';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ExchangeCardProps {
  exchange: SkillExchange;
  onUpdateStatus: (id: string, status: any) => Promise<void>;
  onOpenReview: (exchange: SkillExchange) => void;
}

const statusVariants: Record<string, { label: string; variant: 'teal' | 'blue' | 'amber' | 'emerald' | 'rose' | 'gray' }> = {
  PROPOSED: { label: 'Proposed', variant: 'amber' },
  ACTIVE: { label: 'Active', variant: 'teal' },
  PAUSED: { label: 'Paused', variant: 'gray' },
  COMPLETED: { label: 'Completed', variant: 'emerald' },
  CANCELLED: { label: 'Cancelled', variant: 'rose' },
};

export const ExchangeCard: React.FC<ExchangeCardProps> = ({
  exchange,
  onUpdateStatus,
  onOpenReview,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isInitiator = user?.id === exchange.initiatorId;
  const partner = isInitiator ? exchange.partner : exchange.initiator;

  const teachSkill = isInitiator ? exchange.teachSkill : exchange.learnSkill;
  const learnSkill = isInitiator ? exchange.learnSkill : exchange.teachSkill;

  const statusConfig = statusVariants[exchange.status] || { label: exchange.status, variant: 'gray' };

  // Check if current user already left a review
  const hasReviewed = exchange.reviews?.some((r) => r.reviewerId === user?.id);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card hover:shadow-elevation transition-all p-5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Avatar src={partner.avatarUrl} name={partner.fullName} size="md" />
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">{partner.fullName}</h4>
              <p className="text-xs text-slate-500">{partner.college}</p>
            </div>
          </div>
          <Badge variant={statusConfig.variant} size="md">
            {statusConfig.label}
          </Badge>
        </div>

        {/* Skill Exchange Representation */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mb-4">
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                You Teach
              </span>
              <Badge variant="teal" size="md" className="font-semibold truncate max-w-full">
                {teachSkill}
              </Badge>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                You Learn
              </span>
              <Badge variant="blue" size="md" className="font-semibold truncate max-w-full">
                {learnSkill}
              </Badge>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{exchange.schedule}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize">{exchange.format}</span>
            </div>
          </div>
        </div>

        {/* Agreement notes */}
        {exchange.notes && (
          <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-100 mb-4">
            "{exchange.notes}"
          </p>
        )}
      </div>

      {/* Action Bar */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/messages/${partner.id}`)}
          leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
        >
          Chat
        </Button>

        <div className="flex items-center gap-1.5">
          {exchange.status === 'PROPOSED' && !isInitiator && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onUpdateStatus(exchange.id, 'ACTIVE')}
              leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
            >
              Accept
            </Button>
          )}

          {exchange.status === 'ACTIVE' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(exchange.id, 'PAUSED')}
                leftIcon={<Pause className="w-3.5 h-3.5" />}
              >
                Pause
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onUpdateStatus(exchange.id, 'COMPLETED')}
                leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
              >
                Complete
              </Button>
            </>
          )}

          {exchange.status === 'PAUSED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onUpdateStatus(exchange.id, 'ACTIVE')}
              leftIcon={<Play className="w-3.5 h-3.5" />}
            >
              Resume
            </Button>
          )}

          {exchange.status === 'COMPLETED' && (
            <Button
              variant={hasReviewed ? 'outline' : 'primary'}
              size="sm"
              disabled={hasReviewed}
              onClick={() => onOpenReview(exchange)}
              leftIcon={<Star className="w-3.5 h-3.5" />}
            >
              {hasReviewed ? 'Reviewed' : 'Leave Review'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
