import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Sparkles } from 'lucide-react';
import { Message } from '../../types';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  recipientName?: string;
  recipientAvatar?: string | null;
  recipientOnline?: boolean;
  channelTitle?: string;
  channelSubtitle?: string;
  recipientId?: string;
  groupId?: string;
  roomId?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  recipientName,
  recipientAvatar,
  recipientOnline,
  channelTitle,
  channelSubtitle,
  recipientId,
  groupId,
  roomId,
}) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing listener
  useEffect(() => {
    if (!socket) return;

    socket.on('chat:typing', (data: { senderId: string; userName: string; isTyping: boolean }) => {
      if (data.senderId !== user?.id) {
        if (data.isTyping) {
          setTypingUser(data.userName);
        } else {
          setTypingUser(null);
        }
      }
    });

    return () => {
      socket.off('chat:typing');
    };
  }, [socket, user?.id]);

  const emitTyping = (isTyping: boolean) => {
    if (!socket || !user) return;
    socket.emit('chat:typing', {
      recipientId,
      groupId,
      roomId,
      userName: user.fullName,
      isTyping,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    emitTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
    }, 1500);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    try {
      setIsSending(true);
      emitTyping(false);
      const text = inputText.trim();
      setInputText('');
      await onSendMessage(text);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const title = recipientName || channelTitle || 'Chat';
  const subtitle =
    channelSubtitle || (recipientOnline !== undefined ? (recipientOnline ? 'Online' : 'Offline') : '');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card flex flex-col h-[580px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          {recipientName ? (
            <Avatar
              src={recipientAvatar}
              name={recipientName}
              size="md"
              isOnline={recipientOnline}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
              #
            </div>
          )}
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">{title}</h4>
            {subtitle && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                {recipientOnline !== undefined && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      recipientOnline ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                )}
                <span>{subtitle}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Sparkles className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No messages yet</p>
            <p className="text-xs max-w-xs text-slate-400 mt-1">
              Start the discussion! Ask questions, schedule study sessions, or share resources.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <Avatar
                    src={msg.sender?.avatarUrl}
                    name={msg.sender?.fullName || 'Peer'}
                    size="sm"
                  />
                )}

                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-xs text-sm ${
                    isMe
                      ? 'bg-teal-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
                  }`}
                >
                  {!isMe && msg.sender?.fullName && (
                    <p className="text-[11px] font-semibold text-teal-700 mb-0.5">
                      {msg.sender.fullName}
                    </p>
                  )}
                  <p className="leading-relaxed break-words">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 text-right ${
                      isMe ? 'text-teal-100' : 'text-slate-400'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUser && (
        <div className="px-4 py-1 text-xs text-slate-400 italic bg-white flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span>{typingUser} is typing...</span>
        </div>
      )}

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
