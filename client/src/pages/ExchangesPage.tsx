import React, { useState, useEffect } from 'react';
import { Repeat, Plus, Star, CheckCircle, Clock } from 'lucide-react';
import { exchangeService } from '../services/exchangeService';
import { connectionService } from '../services/connectionService';
import { reviewService } from '../services/reviewService';
import { SkillExchange, ConnectionRecord, ExchangeStatus } from '../types';
import { ExchangeCard } from '../components/exchanges/ExchangeCard';
import { CreateExchangeModal } from '../components/exchanges/CreateExchangeModal';
import { ReviewModal } from '../components/exchanges/ReviewModal';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../contexts/AuthContext';

export const ExchangesPage: React.FC = () => {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState<SkillExchange[]>([]);
  const [connections, setConnections] = useState<ConnectionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedExchangeForReview, setSelectedExchangeForReview] = useState<SkillExchange | null>(null);

  const fetchExchangesData = async () => {
    try {
      setLoading(true);
      const [exRes, connRes] = await Promise.all([
        exchangeService.getExchanges(),
        connectionService.getConnections(),
      ]);
      setExchanges(exRes);
      setConnections(connRes.current);
    } catch (err) {
      console.error('Failed to load exchanges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangesData();
  }, []);

  const handleCreateExchange = async (data: any) => {
    await exchangeService.createExchange(data);
    fetchExchangesData();
  };

  const handleUpdateStatus = async (id: string, status: ExchangeStatus) => {
    await exchangeService.updateExchange(id, { status });
    fetchExchangesData();
  };

  const handleSubmitReview = async (data: any) => {
    await reviewService.createReview(data);
    fetchExchangesData();
  };

  if (loading) {
    return <LoadingSpinner fullHeight message="Loading skill exchanges..." />;
  }

  const active = exchanges.filter((e) => e.status === 'ACTIVE');
  const proposed = exchanges.filter((e) => e.status === 'PROPOSED');
  const past = exchanges.filter((e) => ['COMPLETED', 'PAUSED', 'CANCELLED'].includes(e.status));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Repeat className="w-6 h-6 text-teal-600" />
            <span>Skill Exchange Agreements</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured peer agreements to trade teaching time, set routines, and learn together.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          size="sm"
          disabled={connections.length === 0}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Propose Skill Exchange
        </Button>
      </div>

      {connections.length === 0 && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-800 flex items-center justify-between">
          <span>You need at least one accepted connection to propose a skill exchange.</span>
          <Button onClick={() => (window.location.href = '/discover')} size="sm" variant="outline">
            Find Students
          </Button>
        </div>
      )}

      {/* Active Exchanges */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
          <h2 className="text-base font-bold text-slate-900">Active Exchanges ({active.length})</h2>
        </div>

        {active.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No currently active exchanges. Propose one with your connections above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {active.map((ex) => (
              <ExchangeCard
                key={ex.id}
                exchange={ex}
                onUpdateStatus={handleUpdateStatus}
                onOpenReview={(ex) => setSelectedExchangeForReview(ex)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Proposed Agreements */}
      {proposed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h2 className="text-base font-bold text-slate-900">Pending Proposals ({proposed.length})</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {proposed.map((ex) => (
              <ExchangeCard
                key={ex.id}
                exchange={ex}
                onUpdateStatus={handleUpdateStatus}
                onOpenReview={(ex) => setSelectedExchangeForReview(ex)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed & Past Agreements */}
      {past.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <h2 className="text-base font-bold text-slate-900">Completed & Paused ({past.length})</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {past.map((ex) => (
              <ExchangeCard
                key={ex.id}
                exchange={ex}
                onUpdateStatus={handleUpdateStatus}
                onOpenReview={(ex) => setSelectedExchangeForReview(ex)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create Exchange Modal */}
      <CreateExchangeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        connections={connections}
        onSubmit={handleCreateExchange}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={!!selectedExchangeForReview}
        onClose={() => setSelectedExchangeForReview(null)}
        exchange={selectedExchangeForReview}
        currentUserId={user?.id}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
};
