
import React from 'react';
import { Play, Pause, Rewind, Star } from 'lucide-react';

interface GlobalAudioPlayerProps {
  currentSound: string | null;
  isPlaying: boolean;
  onStop: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onRewind?: () => void;
  onToggleFavorite?: (soundId: string) => void;
  currentSoundId?: string | null;
  isFavorite?: boolean;
  isPaused?: boolean;
}

const GlobalAudioPlayer: React.FC<GlobalAudioPlayerProps> = ({
  currentSound,
  isPlaying,
  onStop,
  onPause,
  onResume,
  onRewind,
  onToggleFavorite,
  currentSoundId,
  isFavorite = false,
  isPaused = false,
}) => {
  if (!currentSound && !isPlaying) {
    return null;
  }

  const formatSoundName = (filename: string): string => {
    if (!filename) return '';
    return filename
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const handlePauseResume = () => {
    if (isPaused && onResume) {
      onResume();
    } else if (!isPaused && onPause) {
      onPause();
    }
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite && currentSoundId) {
      onToggleFavorite(currentSoundId);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="minecraft-button bg-card border-primary p-4 min-w-[280px] shadow-lg">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Now Playing</p>
            <p className="text-sm font-medium text-foreground truncate">
              {formatSoundName(currentSound || '')}
            </p>
          </div>
          
          {onToggleFavorite && currentSoundId && (
            <button
              onClick={handleToggleFavorite}
              className={`minecraft-button p-2 border-2 transition-colors ${
                isFavorite 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
              aria-label="Toggle favorite"
            >
              <Star className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onRewind && (
            <button
              onClick={onRewind}
              className="minecraft-button p-2 bg-secondary text-secondary-foreground border-border hover:bg-accent"
              aria-label="Rewind"
            >
              <Rewind className="w-4 h-4" />
            </button>
          )}
          
          {onPause && onResume && (
            <button
              onClick={handlePauseResume}
              className="minecraft-button p-2 bg-primary text-primary-foreground border-primary hover:bg-primary/90"
              aria-label={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? (
                <Play className="w-4 h-4" fill="currentColor" />
              ) : (
                <Pause className="w-4 h-4" fill="currentColor" />
              )}
            </button>
          )}
          
          <button
            onClick={onStop}
            className="minecraft-button p-2 bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90"
            aria-label="Stop playback"
          >
            <div className="w-4 h-4 bg-current" />
          </button>
          
          <div className="flex-1 ml-2">
            {isPlaying && !isPaused && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-pulse" style={{ width: '100%' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalAudioPlayer;
