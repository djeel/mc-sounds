
import React from 'react';
import { Play } from 'lucide-react';

interface GlobalAudioPlayerProps {
  currentSound: string | null;
  isPlaying: boolean;
  onStop: () => void;
}

const GlobalAudioPlayer: React.FC<GlobalAudioPlayerProps> = ({
  currentSound,
  isPlaying,
  onStop,
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

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="minecraft-button bg-card border-modrinth-green-500 p-4 min-w-[200px] shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Now Playing</p>
            <p className="text-sm font-medium text-foreground truncate">
              {formatSoundName(currentSound || '')}
            </p>
          </div>
          
          <button
            onClick={onStop}
            className="minecraft-button p-2 bg-modrinth-green-500 text-white border-modrinth-green-600 hover:bg-modrinth-green-600 focus:outline-none focus:ring-2 focus:ring-modrinth-green-500"
            aria-label="Stop playback"
          >
            <div className="w-4 h-4 bg-current" />
          </button>
        </div>
        
        {isPlaying && (
          <div className="mt-2 flex items-center gap-2">
            <Play className="w-3 h-3 text-modrinth-green-500 animate-pulse-green" fill="currentColor" />
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-modrinth-green-500 animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalAudioPlayer;
