import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Check, X, MessageSquare, Repeat, Clock, ArrowRight } from 'lucide-react';
import { connectionService, ConnectionsResponse } from '../services/connectionService';
import { discoverService } from '../services/discoverService';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { DiscoverUser } from '../types';

export const ConnectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ConnectionsResponse>({ current: [], incoming: [], sent: [] });
  const [suggested, setSuggested] = useState<DiscoverUser[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'incoming' | 'sent' | 'suggested'>('current');
  const [loading, setLoading] = useState(true);

  const fetchAllConnections = async () => {
    try {
      setLoading(true);
      const [connRes, suggestedRes] = await Promise.all([
        connectionService.getConnections(),
        discoverService.getTopMatches(),
      ]);
      setData(connRes);
      setSuggested(suggestedRes);
    } catch (err) {
      console.error('Failed to load connections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllConnections();
  }, []);

  const handleRespond = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    await connectionService.respondRequest(id, status);
    fetchAllConnections();
  };

  const handleRemove = async (id: string) => {
    if (confirm('Are you sure you want to remove this connection?')) {
      await connectionService.removeConnection(id);
      fetchAllConnections();
    }
  };

  const handleConnect = async (userId: string) => {
    await connectionService.sendRequest(userId);
    fetchAllConnections();
  };

  if (loading) {
    return <LoadingSpinner fullHeight message="Loading connections..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-teal-600" />
          <span>My Learning Connections</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Form skill-exchange partnerships and chat with fellow college peers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('current')}
          className={`pb-3 flex items-center gap-1.5 transition-colors ${
            activeTab === 'current'
              ? 'text-teal-700 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Current Connections</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
            {data.current.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('incoming')}
          className={`pb-3 flex items-center gap-1.5 transition-colors ${
            activeTab === 'incoming'
              ? 'text-teal-700 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Incoming Requests</span>
          {data.incoming.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px]">
              {data.incoming.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-3 flex items-center gap-1.5 transition-colors ${
            activeTab === 'sent'
              ? 'text-teal-700 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Sent Requests</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
            {data.sent.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('suggested')}
          className={`pb-3 flex items-center gap-1.5 transition-colors ${
            activeTab === 'suggested'
              ? 'text-teal-700 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Suggested Peers</span>
          <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px]">
            {suggested.length}
          </span>
        </button>
      </div>

      {/* Tab Contents */}

      {/* 1. Current Connections */}
      {activeTab === 'current' && (
        <div>
          {data.current.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Connections Yet"
              description="Browse students on the Discover page to send connection requests and build your network."
              actionLabel="Discover Students"
              onAction={() => navigate('/discover')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.current.map((conn) => (
                <div
                  key={conn.connectionId}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card hover:shadow-elevation transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar src={conn.peer.avatarUrl} name={conn.peer.fullName} size="md" />
                      <div>
                        <h4
                          onClick={() => navigate(`/profile/${conn.peer.id}`)}
                          className="font-bold text-slate-900 text-sm hover:text-teal-600 transition-colors cursor-pointer"
                        >
                          {conn.peer.fullName}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {conn.peer.college} • {conn.peer.yearOfStudy}
                        </p>
                      </div>
                    </div>

                    {conn.peer.headline && (
                      <p className="text-xs text-slate-600 mb-3 line-clamp-1">
                        {conn.peer.headline}
                      </p>
                    )}

                    <div className="space-y-1.5 mb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Teaches:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {conn.peer.skills
                          ?.filter((s) => s.type === 'TEACH')
                          .slice(0, 3)
                          .map((s) => (
                            <Badge key={s.id} variant="teal" size="sm">
                              {s.skill.name}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/messages/${conn.peer.id}`)}
                      leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                    >
                      Chat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate('/exchanges')}
                      leftIcon={<Repeat className="w-3.5 h-3.5" />}
                    >
                      Exchange
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Incoming Requests */}
      {activeTab === 'incoming' && (
        <div>
          {data.incoming.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              No pending connection requests received.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.incoming.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar src={req.sender?.avatarUrl} name={req.sender?.fullName || 'User'} size="md" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{req.sender?.fullName}</h4>
                      <p className="text-xs text-slate-500">{req.sender?.college}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Received {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleRespond(req.id, 'ACCEPTED')}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-slate-600"
                      onClick={() => handleRespond(req.id, 'REJECTED')}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Sent Requests */}
      {activeTab === 'sent' && (
        <div>
          {data.sent.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              You haven't sent any pending connection requests.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.sent.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar src={req.receiver?.avatarUrl} name={req.receiver?.fullName || 'User'} size="md" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{req.receiver?.fullName}</h4>
                      <p className="text-xs text-slate-500">{req.receiver?.college}</p>
                      <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>Awaiting their response</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-slate-500 text-xs"
                    onClick={() => handleRemove(req.id)}
                  >
                    Cancel Request
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Suggested Peers */}
      {activeTab === 'suggested' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suggested.map((student) => (
            <div key={student.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <Avatar src={student.avatarUrl} name={student.fullName} size="md" />
                    <div>
                      <h4
                        onClick={() => navigate(`/profile/${student.id}`)}
                        className="font-bold text-slate-900 text-sm hover:text-teal-600 transition-colors cursor-pointer"
                      >
                        {student.fullName}
                      </h4>
                      <p className="text-xs text-slate-500">{student.college}</p>
                    </div>
                  </div>
                  <Badge variant="teal" size="sm">
                    {student.compatibility?.score}% Match
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                  {student.bio || student.headline || 'College student'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => handleConnect(student.id)}
                  leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                >
                  Connect
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
