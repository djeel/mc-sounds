import React, { useState } from 'react';
import { Play, Pause, Rewind, Heart, SkipBack, SkipForward, Repeat } from 'lucide-react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

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
  onSelectIndex?: (index: number) => void; // Ajout pour rendre la queue cliquable
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
  onSelectIndex,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const playerRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{width: number, height: number}>({ width: 400, height: 180 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<
    | null
    | {
        x: number;
        y: number;
        width: number;
        height: number;
      }
  >(null);

  const current = queue[currentIndex];
  const hasQueue = queue.length > 0;

  // Pour éviter la superposition, on garde une ref sur l'AudioPlayer
  const audioPlayerRef = React.useRef<any>(null);

  // Stoppe le son en cours avant de jouer un nouveau
  React.useEffect(() => {
    if (!current?.path) return;
    // Ne stoppe que si la source change vraiment
    if (audioPlayerRef.current && audioPlayerRef.current.audio.current) {
      const audio = audioPlayerRef.current.audio.current;
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }, [currentIndex]); // Utilise currentIndex uniquement

  // Drag resize handlers
  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };
  React.useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      if (!dragStart) return;
      // Resize depuis le coin haut gauche, sans déplacer la fenêtre
      const newWidth = Math.max(260, dragStart.width - (e.clientX - dragStart.x));
      const newHeight = Math.max(48, dragStart.height - (e.clientY - dragStart.y));
      setSize({ width: newWidth, height: newHeight });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, dragStart]);

  return (
    <div
      ref={playerRef}
      className="fixed z-50 animate-fade-in bg-card border border-border shadow-lg"
      style={{
        width: size.width,
        height: isMinimized ? 48 : size.height,
        minWidth: 260,
        minHeight: 48,
        maxWidth: '100vw',
        maxHeight: '90vh',
        borderRadius: 8,
        overflow: 'hidden',
        resize: 'none',
        userSelect: dragging ? 'none' : undefined,
        transition: dragging ? 'none' : 'height 0.2s',
        right: 16,
        bottom: 16,
        left: undefined,
        top: undefined,
      }}
    >
      {/* Coin de resize custom haut gauche uniquement */}
      <div
        onMouseDown={onResizeMouseDown}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 18,
          height: 18,
          cursor: 'nwse-resize',
          zIndex: 10,
          background: 'transparent',
          userSelect: 'none',
        }}
      />
      {/* Barre de titre + bouton réduire/agrandir (plus draggable) */}
      <div className="flex items-center justify-between px-3 py-2 bg-card border-b border-border select-none" style={{height: 32}}>
        <span className="text-xs text-foreground truncate flex-1">
          {current ? current.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') : 'No sound playing'}
        </span>
        <button
          className="minecraft-button p-1 ml-2"
          aria-label={isMinimized ? 'Agrandir le player' : 'Réduire le player'}
          onClick={() => setIsMinimized(m => !m)}
          tabIndex={0}
        >
          {isMinimized ? (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M4 12h12M4 8h12" strokeWidth="2" strokeLinecap="round"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M6 10h8" strokeWidth="2" strokeLinecap="round"/></svg>
          )}
        </button>
      </div>
      {/* Mode minimal : juste la barre de titre */}
      {isMinimized ? null : (
        <div className="flex flex-col gap-2 p-4 h-full" style={{height: `calc(100% - 32px)`}}>
          {/* Queue display - only show if there's a queue */}
          {hasQueue && (
            <div className="bg-card border border-border rounded-t-lg p-2 flex flex-col gap-1 max-h-32 overflow-y-auto">
              {queue.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${idx === currentIndex ? 'bg-primary/20 font-bold' : 'cursor-pointer hover:bg-primary/10'}`}
                  onClick={() => onSelectIndex && idx !== currentIndex && onSelectIndex(idx)}
                  style={{ cursor: idx !== currentIndex ? 'pointer' : 'default' }}
                >
                  <span className="truncate flex-1">{item.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')}</span>
                </div>
              ))}
            </div>
          )}
          {/* Nouveau lecteur audio intégré */}
          <AudioPlayer
            ref={audioPlayerRef}
            src={current?.path}
            autoPlay={isPlaying && !isPaused}
            showSkipControls
            showJumpControls={false}
            onClickPrevious={onPrev}
            onClickNext={onNext}
            onPlay={undefined}
            onPause={undefined}
            onEnded={onNext}
            customAdditionalControls={[]}
            customVolumeControls={[]}
            loop={isLooping}
            style={{ borderRadius: 8, marginTop: 8, background: 'var(--card)' }}
          />
          {/* Boutons favoris, loop, stop, etc. peuvent rester sous le player si besoin */}
        </div>
      )}
    </div>
  );
};

export default UnifiedAudioPlayer;
