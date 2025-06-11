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

  // Custom progress bar state
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Pour stocker les durées des tracks
  const [trackDurations, setTrackDurations] = useState<{ [id: string]: number }>({});

  // Pré-charger la durée de chaque track de la queue (si possible)
  React.useEffect(() => {
    const loadDurations = async () => {
      const newDurations: { [id: string]: number } = { ...trackDurations };
      const promises = queue.map(item => {
        if (newDurations[item.id] !== undefined) return null;
        return new Promise<void>(resolve => {
          const audio = new window.Audio(item.path);
          audio.addEventListener('loadedmetadata', () => {
            newDurations[item.id] = audio.duration;
            resolve();
          });
          audio.addEventListener('error', () => {
            newDurations[item.id] = NaN;
            resolve();
          });
        });
      });
      await Promise.all(promises.filter(Boolean));
      setTrackDurations(newDurations);
    };
    if (queue.length > 0) loadDurations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue]);

  // Update progress bar
  const handleTimeUpdate = (e: any) => {
    const audio = e.target;
    setProgress(audio.currentTime);
    setDuration(audio.duration);
  };

  // Seek handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioPlayerRef.current && audioPlayerRef.current.audio.current) {
      audioPlayerRef.current.audio.current.currentTime = Number(e.target.value);
      setProgress(Number(e.target.value));
    }
  };

  // Play/pause handler qui contrôle le player audio
  const handlePlayPause = () => {
    if (audioPlayerRef.current && audioPlayerRef.current.audio.current) {
      const audio = audioPlayerRef.current.audio.current;
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    }
    if (onPlayPause) onPlayPause();
  };

  // Stop handler qui contrôle le player audio
  const handleStop = () => {
    if (audioPlayerRef.current && audioPlayerRef.current.audio.current) {
      const audio = audioPlayerRef.current.audio.current;
      audio.pause();
      audio.currentTime = 0;
    }
    if (onStop) onStop();
  };

  // Loop handler qui contrôle le player audio
  const handleToggleLoop = () => {
    if (audioPlayerRef.current && audioPlayerRef.current.audio.current) {
      const audio = audioPlayerRef.current.audio.current;
      audio.loop = !audio.loop;
    }
    if (onToggleLoop) onToggleLoop();
  };

  // Format time helper
  const formatTime = (sec: number) => {
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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
        display: 'flex',
        flexDirection: 'column',
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
        <div className="flex flex-col flex-1 gap-2 p-4 h-full min-h-0" style={{height: `calc(100% - 32px)`}}>
          {/* Queue display - only show if there's a queue */}
          {hasQueue && (
            <div
              className="bg-card border border-border rounded-t-lg p-2 flex flex-col gap-1 overflow-y-auto"
              style={{
                maxHeight: queue.length > 5 ? 5 * 36 : undefined, // 36px par item environ
                minHeight: 0,
                marginBottom: 8,
              }}
            >
              {queue.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${idx === currentIndex ? 'bg-primary/20 font-bold' : 'cursor-pointer hover:bg-primary/10'}`}
                  onClick={() => onSelectIndex && idx !== currentIndex && onSelectIndex(idx)}
                  style={{ cursor: idx !== currentIndex ? 'pointer' : 'default', minHeight: 32 }}
                >
                  <span className="truncate flex-1">{item.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')}</span>
                  <span className="text-xs text-muted-foreground ml-2" style={{minWidth: 44, textAlign: 'right'}}>
                    {trackDurations[item.id] !== undefined ? formatTime(trackDurations[item.id]) : '--:--'}
                  </span>
                </div>
              ))}
            </div>
          )}
          {/* Zone des boutons + barre de progression toujours en bas */}
          <div className="flex flex-col mt-auto w-full" style={{position: 'relative'}}>
            {/* Custom controls alignés en bas */}
            <div className="flex items-center justify-center gap-3 w-full" style={{}}>
              <button className="minecraft-button p-2" onClick={onPrev} aria-label="Précédent">
                <SkipBack size={20} />
              </button>
              <button className="minecraft-button p-2" onClick={handlePlayPause} aria-label={isPlaying && !isPaused ? 'Pause' : 'Play'}>
                {isPlaying && !isPaused ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button className="minecraft-button p-2" onClick={handleStop} aria-label="Stop">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor"><rect x="5" y="5" width="10" height="10" rx="2" fill="currentColor"/></svg>
              </button>
              <button className={`minecraft-button p-2 ${isLooping ? 'bg-green-600 text-white' : ''}`} onClick={handleToggleLoop} aria-label="Loop">
                <Repeat size={20} />
              </button>
              {onToggleFavorite && (
                <button className={`minecraft-button p-2 ${favorites.has(current?.id) ? 'text-red-500' : ''}`} onClick={() => current && onToggleFavorite(current.id)} aria-label="Favori">
                  <Heart size={20} fill={favorites.has(current?.id) ? 'currentColor' : 'none'} />
                </button>
              )}
              <button className="minecraft-button p-2" onClick={onNext} aria-label="Suivant">
                <SkipForward size={20} />
              </button>
            </div>
            {/* Custom progress bar juste en dessous des boutons */}
            {hasQueue && (
              <div className="w-full flex flex-col gap-1" style={{marginTop: 8}}>
                <input
                  type="range"
                  min={0}
                  max={duration || 1}
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-2 rounded-lg appearance-none bg-gray-200 focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #22c55e ${(progress/(duration||1))*100}%, #e5e7eb ${(progress/(duration||1))*100}%)`,
                    accentColor: '#22c55e',
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}
          </div>
          {/* Nouveau lecteur audio intégré (caché) */}
          <AudioPlayer
            ref={audioPlayerRef}
            src={current?.path}
            autoPlay={isPlaying && !isPaused}
            showSkipControls={false}
            showJumpControls={false}
            showDownloadProgress={false}
            showFilledProgress={false}
            customAdditionalControls={[]}
            customVolumeControls={[]}
            loop={isLooping}
            style={{ display: 'none' }} // Hide native controls
            onClickPrevious={undefined}
            onClickNext={undefined}
            onPlay={undefined}
            onPause={undefined}
            onEnded={onNext}
            onSeeked={handleTimeUpdate}
            onListen={handleTimeUpdate}
            onLoadedMetaData={handleTimeUpdate}
          />
        </div>
      )}
    </div>
  );
};

export default UnifiedAudioPlayer;
