import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Pause,
  Play,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Volume2
} from 'lucide-react';
import { AudioRecorderService, RecordedAudioResult, RecordingState } from '../../lib/audioRecorder';
import { saveVoiceMemo, formatAudioDuration } from '../../lib/audioDb';
import { VoiceMemo } from '../../types/database';

interface AudioRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (memo: VoiceMemo) => void;
  opportunityId?: string;
  agencyId?: string;
  defaultTitle?: string;
}

export const AudioRecorderModal: React.FC<AudioRecorderModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  opportunityId,
  agencyId,
  defaultTitle = 'कन्सल्टेन्सी काउन्सिलर कुराकानी'
}) => {
  const recorderRef = useRef<AudioRecorderService | null>(null);
  const [recState, setRecState] = useState<RecordingState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordedResult, setRecordedResult] = useState<RecordedAudioResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [memoTitle, setMemoTitle] = useState(defaultTitle);
  const [memoNotes, setMemoNotes] = useState('');

  // Quick preset titles
  const PRESET_TITLES = [
    'कन्सल्टेन्सी काउन्सिलर कुराकानी',
    'युरोप भिसा लागत तथा समय छलफल',
    'गल्फ फ्री भिसा फ्रि टिकट सोधपुछ',
    'हातमा पेस्की माग गरिएको रेकर्ड',
    'तलब तथा खाना-बस्न सुविधा विवरण'
  ];

  useEffect(() => {
    if (isOpen) {
      const service = new AudioRecorderService();
      service.onTick((secs) => setElapsedSeconds(secs));
      service.onStateChange((st) => setRecState(st));
      recorderRef.current = service;
      setMemoTitle(defaultTitle);
      setMemoNotes('');
      setRecordedResult(null);
      setPreviewUrl(null);
      setErrorMsg(null);
      setElapsedSeconds(0);
    } else {
      handleCleanup();
    }

    return () => {
      handleCleanup();
    };
  }, [isOpen, defaultTitle]);

  const handleCleanup = () => {
    if (recorderRef.current) {
      recorderRef.current.cancel();
      recorderRef.current = null;
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  if (!isOpen) return null;

  const handleStartRecording = async () => {
    setErrorMsg(null);
    try {
      if (recorderRef.current) {
        await recorderRef.current.start();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start recording');
    }
  };

  const handlePauseResume = () => {
    if (!recorderRef.current) return;
    if (recState === 'recording') {
      recorderRef.current.pause();
    } else if (recState === 'paused') {
      recorderRef.current.resume();
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current) return;
    try {
      const result = await recorderRef.current.stop();
      setRecordedResult(result);
      const url = URL.createObjectURL(result.blob);
      setPreviewUrl(url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to stop recording');
    }
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setRecordedResult(null);
    setElapsedSeconds(0);
    setRecState('idle');
    const service = new AudioRecorderService();
    service.onTick((secs) => setElapsedSeconds(secs));
    service.onStateChange((st) => setRecState(st));
    recorderRef.current = service;
  };

  const handleSave = async () => {
    if (!recordedResult) return;
    setIsSaving(true);
    try {
      const newMemo = await saveVoiceMemo({
        opportunity_id: opportunityId,
        agency_id: agencyId,
        title: memoTitle.trim() || 'Untitled Voice Memo',
        blob: recordedResult.blob,
        duration_seconds: recordedResult.durationSeconds,
        mime_type: recordedResult.mimeType,
        file_size_bytes: recordedResult.sizeBytes,
        notes: memoNotes.trim() || undefined
      });

      onSaved(newMemo);
      onClose();
    } catch (err: any) {
      setErrorMsg('Failed to save voice memo to local database: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && recState !== 'recording') onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-lg border border-slate-300 p-5 max-w-md w-full shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${recState === 'recording' ? 'bg-red-600 animate-ping' : 'bg-teal-700'}`} />
            <h3 className="text-sm font-bold text-slate-900">
              Field Audio Memo (कन्सल्टेन्सी अडियो रेकर्डर)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={recState === 'recording'}
            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 disabled:opacity-30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Main Recording Body */}
        {!recordedResult ? (
          <div className="py-6 text-center space-y-4">
            {/* Visual Pulsing Status Indicator */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              {recState === 'recording' && (
                <>
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                  <div className="absolute -inset-2 rounded-full bg-red-500/10 animate-pulse" />
                </>
              )}
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-md ${
                  recState === 'recording'
                    ? 'bg-red-600 text-white shadow-red-600/30'
                    : recState === 'paused'
                    ? 'bg-amber-500 text-white'
                    : 'bg-teal-800 text-white shadow-teal-800/20'
                }`}
              >
                <Mic className={`w-8 h-8 ${recState === 'recording' ? 'animate-bounce' : ''}`} />
              </div>
            </div>

            {/* Timer Display */}
            <div className="space-y-1">
              <div className="font-mono text-3xl font-extrabold text-slate-900 tracking-wider">
                {formatAudioDuration(elapsedSeconds)}
              </div>
              <div className="text-xs font-semibold text-slate-500">
                {recState === 'recording'
                  ? 'Recording in progress... (रेकर्ड हुँदैछ)'
                  : recState === 'paused'
                  ? 'Recording paused (रोकिएको छ)'
                  : 'Ready to record office discussion'}
              </div>
            </div>

            {/* Audio waveform simulation bars */}
            {recState === 'recording' && (
              <div className="flex items-center justify-center gap-1 h-6">
                {[40, 75, 100, 60, 85, 45, 95, 70, 50, 90, 65, 80, 55, 100, 45].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-500 rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${(i % 5) * 120}ms`
                    }}
                  />
                ))}
              </div>
            )}

            {/* Control Buttons */}
            <div className="pt-2 flex items-center justify-center gap-3">
              {recState === 'idle' && (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-md font-bold text-xs shadow-sm flex items-center gap-2 transition"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  <span>Start Recording (रेकर्ड सुरु गर्नुहोस्)</span>
                </button>
              )}

              {(recState === 'recording' || recState === 'paused') && (
                <>
                  <button
                    type="button"
                    onClick={handlePauseResume}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-semibold text-slate-800 flex items-center gap-1.5 transition"
                  >
                    {recState === 'recording' ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                        <span>Resume</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>Stop & Review (समाप्त)</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Review & Save Form */
          <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
            {/* Audio Preview Player */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
              <div className="flex items-center justify-between text-2xs text-slate-600 font-semibold">
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-teal-700" />
                  <span>Playback Preview:</span>
                </span>
                <span className="font-mono text-slate-800 font-bold">
                  Duration: {formatAudioDuration(recordedResult.durationSeconds)}
                </span>
              </div>
              {previewUrl && (
                <audio controls className="w-full h-8 accent-teal-800" src={previewUrl} />
              )}
            </div>

            {/* Memo Title */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Audio Memo Title (अडियो शीर्षक)
              </label>
              <input
                type="text"
                required
                value={memoTitle}
                onChange={(e) => setMemoTitle(e.target.value)}
                placeholder="e.g. कन्सल्टेन्सी काउन्सिलर कुराकानी"
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-teal-700"
              />

              {/* Preset Quick Chips */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {PRESET_TITLES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMemoTitle(t)}
                    className="text-3xs px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Field */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Key Statements / Verbal Promises Noted (मुख्य कुराहरू)
              </label>
              <textarea
                rows={2}
                value={memoNotes}
                onChange={(e) => setMemoNotes(e.target.value)}
                placeholder="e.g. काउन्सिलरले २ महिनाभित्र युरोप भिसा १००% आउँछ भनेको र ३ लाख हातमा मागेको..."
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-teal-700"
              />
            </div>

            {/* Privacy & Legal Advisory Note */}
            <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded text-3xs text-blue-900 space-y-0.5">
              <span className="font-bold block">🔒 कानुनी तथा व्यक्तिगत सुरक्षा नोट:</span>
              <p className="leading-relaxed">
                यो अडियो तपाईंकै मोबाइलको मेमोरी (IndexedDB) मा सुरक्षित रहन्छ। कसैले व्यक्तिगत खातामा पैसा मागेमा वा झुटा आश्वासन दिएमा यो रेकर्ड प्रमाणको रूपमा काम लाग्नेछ।
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-300 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-record</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-1.5 bg-teal-800 hover:bg-teal-700 text-white rounded font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Audio Memo (सुरक्षित राख्नुहोस्)'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
