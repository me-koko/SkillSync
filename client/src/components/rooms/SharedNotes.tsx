import React, { useState, useEffect } from 'react';
import { FileText, Save, Check } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { roomService } from '../../services/roomService';

interface SharedNotesProps {
  roomId: string;
  initialNotes: string;
}

export const SharedNotes: React.FC<SharedNotesProps> = ({ roomId, initialNotes }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [notes, setNotes] = useState(initialNotes || '');
  const [lastEditor, setLastEditor] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(true);

  // Real-time synchronization
  useEffect(() => {
    if (!socket) return;

    socket.on('room:notes_sync', (data: { roomId: string; notes: string; updatedBy: string }) => {
      if (data.roomId === roomId) {
        setNotes(data.notes);
        setLastEditor(data.updatedBy);
        setIsSaved(true);
      }
    });

    return () => {
      socket.off('room:notes_sync');
    };
  }, [socket, roomId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    setIsSaved(false);

    // Broadcast change to other members in room
    if (socket) {
      socket.emit('room:notes_sync', {
        roomId,
        notes: val,
        updatedBy: user?.fullName || 'Someone',
      });
    }
  };

  const handleSaveToDb = async () => {
    try {
      await roomService.updateNotes(roomId, notes);
      setIsSaved(true);
    } catch (err) {
      console.error('Failed to persist notes:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
          <FileText className="w-4 h-4 text-teal-600" />
          <span>Shared Collaborative Notes</span>
        </div>

        <div className="flex items-center gap-2">
          {lastEditor && (
            <span className="text-[11px] text-slate-400 italic truncate max-w-[120px]">
              Edited by {lastEditor}
            </span>
          )}
          <button
            onClick={handleSaveToDb}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
              isSaved
                ? 'bg-slate-50 text-slate-500 border-slate-200'
                : 'bg-teal-50 text-teal-700 border-teal-200 font-medium'
            }`}
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      <textarea
        value={notes}
        onChange={handleChange}
        onBlur={handleSaveToDb}
        placeholder="Type shared study room notes here... Every peer in this room sees updates in real time!"
        className="flex-1 w-full p-3.5 text-sm text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white resize-none font-mono min-h-[220px]"
      />
    </div>
  );
};
