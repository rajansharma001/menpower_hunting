// ==============================================================================
// Audio Recording Service (MediaRecorder Wrapper for Mobile & Desktop)
// Handles audio stream, format selection, elapsed timers, and blob generation
// ==============================================================================

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

export interface RecordedAudioResult {
  blob: Blob;
  durationSeconds: number;
  mimeType: string;
  sizeBytes: number;
}

export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private recordedChunks: Blob[] = [];
  private state: RecordingState = 'idle';
  private startTime: number = 0;
  private pausedTime: number = 0;
  private elapsedSeconds: number = 0;
  private timerInterval: any = null;
  private selectedMimeType: string = '';

  private onTickCallback?: (seconds: number) => void;
  private onStateChangeCallback?: (state: RecordingState) => void;

  public static isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof MediaRecorder !== 'undefined'
    );
  }

  public static getPreferredMimeType(): string {
    if (typeof MediaRecorder === 'undefined') return 'audio/webm';

    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus'
    ];

    for (const candidate of candidates) {
      if (MediaRecorder.isTypeSupported(candidate)) {
        return candidate;
      }
    }

    return '';
  }

  public onTick(cb: (seconds: number) => void) {
    this.onTickCallback = cb;
  }

  public onStateChange(cb: (state: RecordingState) => void) {
    this.onStateChangeCallback = cb;
  }

  public getState(): RecordingState {
    return this.state;
  }

  public async start(): Promise<void> {
    if (!AudioRecorderService.isSupported()) {
      throw new Error('Audio recording is not supported in this browser environment.');
    }

    // Stop any existing stream
    this.cleanup();

    this.recordedChunks = [];
    this.elapsedSeconds = 0;
    this.selectedMimeType = AudioRecorderService.getPreferredMimeType();

    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Microphone permission was denied. Please allow microphone access in your browser settings (माइक अनुमति दिनुहोस्)।');
      }
      throw new Error(`Microphone access error: ${err.message || 'Unknown error'}`);
    }

    const options: MediaRecorderOptions = {};
    if (this.selectedMimeType) {
      options.mimeType = this.selectedMimeType;
    }

    this.mediaRecorder = new MediaRecorder(this.audioStream, options);

    this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.start(250); // Slice data every 250ms for reliable chunking
    this.state = 'recording';
    this.startTime = Date.now();
    this.pausedTime = 0;

    this.startTimer();
    this.onStateChangeCallback?.(this.state);
  }

  public pause(): void {
    if (this.mediaRecorder && this.state === 'recording') {
      this.mediaRecorder.pause();
      this.state = 'paused';
      this.stopTimer();
      this.onStateChangeCallback?.(this.state);
    }
  }

  public resume(): void {
    if (this.mediaRecorder && this.state === 'paused') {
      this.mediaRecorder.resume();
      this.state = 'recording';
      this.startTimer();
      this.onStateChangeCallback?.(this.state);
    }
  }

  public stop(): Promise<RecordedAudioResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recorder to stop.'));
        return;
      }

      this.stopTimer();

      this.mediaRecorder.onstop = () => {
        const finalMimeType = this.mediaRecorder?.mimeType || this.selectedMimeType || 'audio/webm';
        const blob = new Blob(this.recordedChunks, { type: finalMimeType });
        const result: RecordedAudioResult = {
          blob,
          durationSeconds: Math.max(1, Math.round(this.elapsedSeconds)),
          mimeType: finalMimeType,
          sizeBytes: blob.size
        };

        this.cleanup();
        this.state = 'stopped';
        this.onStateChangeCallback?.(this.state);
        resolve(result);
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        reject(e);
      }
    });
  }

  public cancel(): void {
    this.cleanup();
    this.state = 'idle';
    this.onStateChangeCallback?.(this.state);
  }

  private startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds += 0.5;
      this.onTickCallback?.(Math.floor(this.elapsedSeconds));
    }, 500);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private cleanup() {
    this.stopTimer();
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
    this.mediaRecorder = null;
  }
}
