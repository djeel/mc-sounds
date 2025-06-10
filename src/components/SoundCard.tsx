import React, { useState } from 'react';
import { Play, Download } from 'lucide-react';

interface SoundCardProps {
  soundId: string;
  soundName: string;
  soundPath: string;
  category: string;
  isPlaying: boolean;
  isFavorite: boolean;
  onPlay: (soundPath: string, soundId: string) => void;
  onToggleFavorite: (soundId: string) => void;
  disableAnimation?: boolean;
}

const SoundCard: React.FC<SoundCardProps> = ({
  soundId,
  soundName,
  soundPath,
  category,
  isPlaying,
  isFavorite,
  onPlay,
  onToggleFavorite,
  disableAnimation,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatSoundName = (filename: string): string => {
    return filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
  };

  const handlePlay = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onPlay(soundPath, soundId);
    } catch (err) {
      setError('Failed to play audio');
      console.error('Play error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = soundPath;
      link.download = soundName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleFavoriteToggle = () => {
    onToggleFavorite(soundId);
  };

  return (
    <div className={`sound-card${disableAnimation ? '' : ' animate-fade-in'} flex flex-col justify-between h-full`}>
      {/* Sound info */}
      <div className="mb-3">
        <h3 className="font-semibold text-foreground text-sm mb-1 leading-tight">
          {formatSoundName(soundName)}
        </h3>
        <p className="text-xs text-foreground capitalize">{category}</p>
        <p className="text-xs text-muted-foreground break-all">{soundId}</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex items-center gap-2">
          {/* Play button */}
          <button
            onClick={handlePlay}
            disabled={isLoading}
            className={`minecraft-button p-2 flex items-center justify-center transition-colors
              ${isPlaying ? 'bg-primary-green-500 text-white border-primary-green-600' : 'bg-card text-foreground border-foreground'}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            aria-label={isPlaying ? 'Currently playing' : 'Play sound'}
            style={{ color: 'inherit' }}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play 
                className={`w-4 h-4 ${isPlaying ? 'animate-pulse-green' : ''}`} 
                fill={isPlaying ? 'currentColor' : 'none'}
                stroke="currentColor"
              />
            )}
          </button>

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="minecraft-button p-2 flex items-center justify-center transition-colors bg-card text-foreground border-foreground"
            aria-label="Download sound"
            style={{ color: 'inherit' }}
          >
            <Download className="w-4 h-4" stroke="currentColor" />
          </button>
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFavoriteToggle}
          className={`minecraft-button p-2 flex items-center justify-center transition-colors
            ${isFavorite ? 'bg-primary-green-500 text-white border-primary-green-600' : 'bg-card text-foreground border-foreground'}
          `}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
        >
          <svg 
            className="w-4 h-4"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SoundCard;
