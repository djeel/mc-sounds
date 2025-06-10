import React, { useState } from 'react';
import { Play, Pause, Rewind, Heart, SkipBack, SkipForward, Repeat } from 'lucide-react';

interface AudioQueueItem {
  id: string;
  name: string;
  path: string;
}

interface UnifiedAudioPlayerProps {
  queue: AudioQueueItem[];
  currentIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  isLooping: boolean;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onStop: () => void;
  onToggleLoop: () => void;
  onToggleFavorite?: (soundId: string) => void;
  favorites?: Set<string>;
}

const UnifiedAudioPlayer: React.FC<UnifiedAudioPlayerProps> = ({
  queue,
  currentIndex,
  isPlaying,
  isPaused,
  isLooping,
  onPlayPause,
  onPrev,
  onNext,
  onStop,
  onToggleLoop,
  onToggleFavorite,
  favorites = new Set(),
}) => {
  // Toujours afficher le player, même si la queue est vide
  const current = queue[currentIndex];
  const hasQueue = queue.length > 0;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in w-full max-w-md">
      {/* Queue display - only show if there's a queue */}
      {hasQueue && (
        <div className="bg-card border border-border rounded-t-lg p-2 flex flex-col gap-1 max-h-32 overflow-y-auto">
          {queue.map((item, idx) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${idx === currentIndex ? 'bg-primary/20 font-bold' : ''}`}
            >
              <span className="truncate flex-1">{item.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')}</span>
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(item.id)}
                  className={`p-1 rounded ${favorites.has(item.id) ? 'text-primary' : 'text-muted-foreground'}`}
                  aria-label="Toggle favorite"
                >
                  <Heart className="w-4 h-4" fill={favorites.has(item.id) ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Player controls */}
      <div className={`bg-card border border-border ${hasQueue ? 'rounded-b-lg border-t-0' : 'rounded-lg'} p-4 flex flex-col gap-2 shadow-lg`}>
        <div className="flex items-center justify-between gap-2">
          <button 
            onClick={onPrev} 
            className="minecraft-button p-2" 
            aria-label="Previous"
            disabled={!hasQueue}
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button 
            onClick={onPlayPause} 
            className="minecraft-button p-2 bg-primary text-primary-foreground border-primary" 
            aria-label={isPaused ? 'Play' : 'Pause'}
            disabled={!hasQueue}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button 
            onClick={onNext} 
            className="minecraft-button p-2" 
            aria-label="Next"
            disabled={!hasQueue}
          >
            <SkipForward className="w-4 h-4" />
          </button>          <button 
            onClick={onToggleLoop} 
            className={`minecraft-button p-2 ${isLooping ? 'bg-primary text-primary-foreground border-primary' : ''}`} 
            aria-label="Loop"
            disabled={!hasQueue}
          >
            <Repeat className="w-4 h-4" />
          </button>
          <button 
            onClick={onStop} 
            className="minecraft-button p-2 bg-destructive text-destructive-foreground border-destructive" 
            aria-label="Stop"
            disabled={!hasQueue}
          >
            <div className="w-4 h-4 bg-current" />
          </button>
        </div>
        <div className="text-xs text-muted-foreground truncate text-center">
          {current ? current.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') : 'Aucun son en cours'}
        </div>
      </div>
    </div>
  );
};

export default UnifiedAudioPlayer;
