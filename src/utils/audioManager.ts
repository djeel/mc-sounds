
/**
 * Audio Manager Utility
 * Handles audio playback, cleanup, and state management
 */

export class AudioManager {
  private static instance: AudioManager;
  private currentAudio: HTMLAudioElement | null = null;
  private currentSoundId: string | null = null;
  private onPlayCallback: ((soundId: string) => void) | null = null;
  private onStopCallback: (() => void) | null = null;
  private onPauseCallback: (() => void) | null = null;
  private onResumeCallback: (() => void) | null = null;
  private isPaused: boolean = false;

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  setCallbacks(
    onPlay: (soundId: string) => void, 
    onStop: () => void,
    onPause?: () => void,
    onResume?: () => void
  ) {
    this.onPlayCallback = onPlay;
    this.onStopCallback = onStop;
    this.onPauseCallback = onPause;
    this.onResumeCallback = onResume;
  }

  async playSound(soundPath: string, soundId: string): Promise<void> {
    try {
      // Stop current audio if playing
      this.stopCurrent();

      // Create new audio instance - using a placeholder for demo
      // In a real app, you would load the actual audio file
      console.log(`Playing sound: ${soundPath} (${soundId})`);
      
      // Simulate audio creation and playback
      this.currentSoundId = soundId;
      this.isPaused = false;
      
      if (this.onPlayCallback) {
        this.onPlayCallback(soundId);
      }

      // Simulate audio duration and auto-stop after 3 seconds
      setTimeout(() => {
        if (this.currentSoundId === soundId && !this.isPaused) {
          this.cleanup();
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error playing sound:', error);
      throw error;
    }
  }

  pauseCurrent(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.isPaused = true;
      if (this.onPauseCallback) {
        this.onPauseCallback();
      }
    }
  }

  resumeCurrent(): void {
    if (this.currentAudio && this.currentAudio.paused && this.isPaused) {
      this.currentAudio.play().catch(console.error);
      this.isPaused = false;
      if (this.onResumeCallback) {
        this.onResumeCallback();
      }
    }
  }

  rewindCurrent(): void {
    if (this.currentAudio) {
      this.currentAudio.currentTime = 0;
    }
  }

  stopCurrent(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
    this.isPaused = false;
    this.cleanup();
  }

  getCurrentSoundId(): string | null {
    return this.currentSoundId;
  }

  isPlaying(): boolean {
    return this.currentSoundId !== null && !this.isPaused;
  }

  isPausedState(): boolean {
    return this.isPaused;
  }

  private cleanup(): void {
    if (this.currentAudio) {
      this.currentAudio.removeEventListener('ended', this.cleanup);
      this.currentAudio.removeEventListener('error', this.cleanup);
      this.currentAudio = null;
    }
    this.currentSoundId = null;
    this.isPaused = false;
    
    if (this.onStopCallback) {
      this.onStopCallback();
    }
  }

  destroy(): void {
    this.stopCurrent();
    this.onPlayCallback = null;
    this.onStopCallback = null;
    this.onPauseCallback = null;
    this.onResumeCallback = null;
  }
}
