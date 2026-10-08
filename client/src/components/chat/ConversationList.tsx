import React from 'react';
import { ConversationSummary } from '../../services/chatService';
import { Avatar } from '../common/Avatar';
import { useSocket } from '../../contexts/SocketContext';

interface ConversationListProps {
  conversations: ConversationSummary[];
  selectedPeerId?: string;
  onSelectPeer: (peerId: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedPeerId,
  onSelectPeer,
}) => {
  const { isOnline } = useSocket();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden flex flex-col h-[580px]">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-semibold text-slate-900 text-sm">Direct Messages</h3>
        <p className="text-xs text-slate-500 mt-0.5">Chat with your peer connections</p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No active conversations. Connect with a student in Discover to start chatting!
          </div>
        ) : (
          conversations.map((convo) => {
            const isSelected = selectedPeerId === convo.peer.id;
            const peerOnline = isOnline(convo.peer.id);

            return (
              <div
                key={convo.peer.id}
                onClick={() => onSelectPeer(convo.peer.id)}
                className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-teal-50/80 border-l-4 border-teal-600'
                    : 'hover:bg-slate-50'
                }`}
              >
                <Avatar
                  src={convo.peer.avatarUrl}
                  name={convo.peer.fullName}
                  size="md"
                  isOnline={peerOnline}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h5
                      className={`text-sm font-semibold truncate ${
                        isSelected ? 'text-teal-900' : 'text-slate-900'
                      }`}
                    >
                      {convo.peer.fullName}
                    </h5>
                    {convo.lastMessage && (
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {new Date(convo.lastMessage.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 truncate">
                    {convo.lastMessage ? convo.lastMessage.content : 'No messages yet'}
                  </p>
                </div>

                {convo.unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[11px] font-bold">
                    {convo.unreadCount}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
