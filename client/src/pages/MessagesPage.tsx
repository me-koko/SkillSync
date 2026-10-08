import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Sparkles } from 'lucide-react';
import { chatService, ConversationSummary } from '../../src/services/chatService';
import { Message } from '../types';
import { ConversationList } from '../components/chat/ConversationList';
import { ChatWindow } from '../components/chat/ChatWindow';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const MessagesPage: React.FC = () => {
  const { id: routePeerId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket, isOnline, latestMessage } = useSocket();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedPeerId, setSelectedPeerId] = useState<string | undefined>(routePeerId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch conversations list
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await chatService.getConversations();
      setConversations(data);

      if (!selectedPeerId && data.length > 0) {
        setSelectedPeerId(data[0].peer.id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Update selected peer if route param changes
  useEffect(() => {
    if (routePeerId) {
      setSelectedPeerId(routePeerId);
    }
  }, [routePeerId]);

  // Load messages when selectedPeerId changes
  useEffect(() => {
    if (!selectedPeerId) return;

    chatService
      .getDirectMessages(selectedPeerId)
      .then((msgs) => setMessages(msgs))
      .catch((err) => console.error('Failed to load messages:', err));
  }, [selectedPeerId]);

  // Real-time incoming direct message handling
  useEffect(() => {
    if (!latestMessage) return;

    if (
      (latestMessage.senderId === selectedPeerId && latestMessage.receiverId === user?.id) ||
      (latestMessage.senderId === user?.id && latestMessage.receiverId === selectedPeerId)
    ) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === latestMessage.id)) return prev;
        return [...prev, latestMessage];
      });
    }

    // Refresh conversation list to show updated last message
    fetchConversations();
  }, [latestMessage, selectedPeerId, user?.id]);

  const handleSendMessage = async (content: string) => {
    if (!selectedPeerId) return;
    await chatService.sendMessage({ content, receiverId: selectedPeerId });
  };

  const handleSelectPeer = (peerId: string) => {
    setSelectedPeerId(peerId);
    navigate(`/messages/${peerId}`);
  };

  const activeConvo = conversations.find((c) => c.peer.id === selectedPeerId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-teal-600" />
          <span>Real-Time Peer Chat</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          One-on-one communication with your accepted peer connections.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner fullHeight message="Loading chat hub..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Sidebar: Conversations */}
          <div className="md:col-span-5 lg:col-span-4">
            <ConversationList
              conversations={conversations}
              selectedPeerId={selectedPeerId}
              onSelectPeer={handleSelectPeer}
            />
          </div>

          {/* Right Main: Active Chat Window */}
          <div className="md:col-span-7 lg:col-span-8">
            {activeConvo ? (
              <ChatWindow
                messages={messages}
                onSendMessage={handleSendMessage}
                recipientName={activeConvo.peer.fullName}
                recipientAvatar={activeConvo.peer.avatarUrl}
                recipientOnline={isOnline(activeConvo.peer.id)}
                recipientId={activeConvo.peer.id}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-12 text-center h-[580px] flex flex-col items-center justify-center">
                <Sparkles className="w-12 h-12 text-teal-600/40 mb-3" />
                <h3 className="text-base font-bold text-slate-900">Select a Conversation</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Choose a peer on the left to review message history and start chatting in real time.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
