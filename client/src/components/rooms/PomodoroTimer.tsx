import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Volume2 } from 'lucide-react';
import { Button } from '../common/Button';
import { useSocket } from '../../contexts/SocketContext';

interface PomodoroTimerProps {
  roomId: string;
  initialSeconds?: number;
  isInitialRunning?: boolean;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  roomId,
  initialSeconds = 1500, // 25 min default
  isInitialRunning = false,
}) => {
  const { socket } = useSocket();
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(isInitialRunning);

  // Synchronize timer over Socket.IO
  useEffect(() => {
    if (!socket) return;

    socket.on('room:timer_sync', (data: { roomId: string; activeTimer: number; isTimerOn: boolean }) => {
      if (data.roomId === roomId) {
        setSeconds(data.activeTimer);
        setIsRunning(data.isTimerOn);
      }
    });

    return () => {
      socket.off('room:timer_sync');
    };
  }, [socket, roomId]);

  // Local ticker
  useEffect(() => {
    let interval: any = null;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (seconds === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const broadcastTimer = (newSeconds: number, running: boolean) => {
    if (socket) {
      socket.emit('room:timer_sync', {
        roomId,
        activeTimer: newSeconds,
        isTimerOn: running,
      });
    }
  };

  const handleToggle = () => {
    const nextState = !isRunning;
    setIsRunning(nextState);
    broadcastTimer(seconds, nextState);
  };

  const handleReset = (preset: number = 1500) => {
    setIsRunning(false);
    setSeconds(preset);
    broadcastTimer(preset, false);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-card border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          <span>Synced Study Timer</span>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
          {isRunning ? 'Focusing' : 'Paused'}
        </span>
      </div>

      {/* Digits Display */}
      <div className="text-center py-4">
        <div className="text-5xl font-mono font-bold tracking-tight text-white select-none">
          {formatTime(seconds)}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Real-time synchronized across all peers in this room
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <Button
          onClick={handleToggle}
          variant={isRunning ? 'secondary' : 'primary'}
          size="md"
          className="px-6"
          leftIcon={isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        >
          {isRunning ? 'Pause' : 'Start Timer'}
        </Button>
        <button
          onClick={() => handleReset(1500)}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Reset timer to 25 mins"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800">
        <button
          onClick={() => handleReset(1500)}
          className={`py-1.5 text-xs font-medium rounded-lg transition-colors ${
            seconds === 1500 ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40' : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          25m Pomodoro
        </button>
        <button
          onClick={() => handleReset(3000)}
          className={`py-1.5 text-xs font-medium rounded-lg transition-colors ${
            seconds === 3000 ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40' : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          50m Deep Work
        </button>
        <button
          onClick={() => handleReset(300)}
          className={`py-1.5 text-xs font-medium rounded-lg transition-colors ${
            seconds === 300 ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40' : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          5m Break
        </button>
      </div>
    </div>
  );
};
