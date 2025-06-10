
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

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  setCallbacks(onPlay: (soundId: string) => void, onStop: () => void) {
    this.onPlayCallback = onPlay;
    this.onStopCallback = onStop;
  }

  async playSound(soundPath: string, soundId: string): Promise<void> {
    try {
      // Stop current audio if playing
      this.stopCurrent();

      // Create new audio instance
      const audio = new HTMLAudioElement();
      audio.src = soundPath;
      audio.preload = 'none'; // Lazy loading
      
      // Set up event listeners
      audio.addEventListener('ended', () => {
        this.cleanup();
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        this.cleanup();
        throw new Error(`Failed to play audio: ${soundPath}`);
      });

      // Play the audio
      await audio.play();
      
      this.currentAudio = audio;
      this.currentSoundId = soundId;
      
      if (this.onPlayCallback) {
        this.onPlayCallback(soundId);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
      throw error;
    }
  }

  stopCurrent(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.cleanup();
    }
  }

  getCurrentSoundId(): string | null {
    return this.currentSoundId;
  }

  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  private cleanup(): void {
    if (this.currentAudio) {
      this.currentAudio.removeEventListener('ended', this.cleanup);
      this.currentAudio.removeEventListener('error', this.cleanup);
      this.currentAudio = null;
    }
    this.currentSoundId = null;
    
    if (this.onStopCallback) {
      this.onStopCallback();
    }
  }

  destroy(): void {
    this.stopCurrent();
    this.onPlayCallback = null;
    this.onStopCallback = null;
  }
}
