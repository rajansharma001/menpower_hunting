import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Trash2, Volume2, Clock } from 'lucide-react';
import { VoiceMemo } from '../../types/database';
import { downloadVoiceMemo, formatAudioDuration, formatAudioSize } from '../../lib/audioDb';

interface VoiceMemoPlayerProps {
  memo: VoiceMemo;
  onDelete?: (id: string) => void;
}

export const VoiceMemoPlayer: React.FC<VoiceMemoPlayerProps> = ({ memo, onDelete }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(memo.duration_seconds || 0);
  const [audioUrl, setAudioUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(memo.blob);
    setAudioUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [memo.blob]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.warn('Playback error', err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete voice memo "${memo.title}"?`)) {
      onDelete?.(memo.id);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2.5 shadow-2xs">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}

      {/* Header Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="flex items-center space-x-1.5">
            <Volume2 className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {memo.title || 'Untitled Voice Memo'}
            </h4>
          </div>
          <div className="flex items-center gap-x-3 text-3xs text-slate-500">
            <span>{new Date(memo.created_at).toLocaleDateString()} {new Date(memo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>•</span>
            <span>{formatAudioSize(memo.file_size_bytes)}</span>
            <span>•</span>
            <span className="font-mono text-slate-600">{memo.mime_type.split(';')[0]}</span>
          </div>
        </div>

        {/* Action Buttons: Download & Delete */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => downloadVoiceMemo(memo)}
            className="p-1.5 text-slate-500 hover:text-teal-800 hover:bg-slate-200/70 rounded transition"
            title="Download Audio Clip"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition"
              title="Delete Voice Memo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {memo.notes && (
        <p className="text-2xs text-slate-600 bg-white p-2 rounded border border-slate-200 italic leading-relaxed">
          &ldquo;{memo.notes}&rdquo;
        </p>
      )}

      {/* Playback Controls & Scrubber */}
      <div className="flex items-center space-x-2.5 pt-0.5">
        <button
          type="button"
          onClick={handlePlayPause}
          className="w-8 h-8 rounded-full bg-teal-800 hover:bg-teal-900 text-white flex items-center justify-center flex-shrink-0 transition shadow-2xs active:scale-95"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-white" />
          ) : (
            <Play className="w-4 h-4 fill-white ml-0.5" />
          )}
        </button>

        {/* Scrubber slider */}
        <div className="flex-1 space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-800 focus:outline-none"
          />
          <div className="flex justify-between text-3xs font-mono text-slate-500">
            <span>{formatAudioDuration(currentTime)}</span>
            <span>{formatAudioDuration(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
