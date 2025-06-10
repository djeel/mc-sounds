
import { useState, useCallback, useEffect } from 'react';

interface Sound {
  id: string;
  name: string;
  path: string;
  category: string;
}

interface UseSequentialPlayProps {
  sounds: Sound[];
  onPlaySound: (soundPath: string, soundId: string) => Promise<void>;
  currentPlayingSound: string | null;
}

export const useSequentialPlay = ({ sounds, onPlaySound, currentPlayingSound }: UseSequentialPlayProps) => {
  const [isSequentialMode, setIsSequentialMode] = useState(false);
  const [currentQueue, setCurrentQueue] = useState<Sound[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const playNextInQueue = useCallback(async () => {
    if (currentQueue.length === 0 || currentIndex >= currentQueue.length) {
      setIsSequentialMode(false);
      setCurrentQueue([]);
      setCurrentIndex(0);
      return;
    }

    const nextSound = currentQueue[currentIndex];
    try {
      await onPlaySound(nextSound.path, nextSound.id);
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error playing next sound:', error);
      // Continue to next sound even if current one fails
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentQueue, currentIndex, onPlaySound]);

  const startSequentialPlay = useCallback((categoryName: string) => {
    const categorySounds = sounds.filter(sound => sound.category === categoryName);
    if (categorySounds.length === 0) return;

    setCurrentQueue(categorySounds);
    setCurrentIndex(0);
    setIsSequentialMode(true);
    
    // Start playing the first sound
    const firstSound = categorySounds[0];
    onPlaySound(firstSound.path, firstSound.id);
  }, [sounds, onPlaySound]);

  const stopSequentialPlay = useCallback(() => {
    setIsSequentialMode(false);
    setCurrentQueue([]);
    setCurrentIndex(0);
  }, []);

  // Listen for sound end to play next
  useEffect(() => {
    if (isSequentialMode && !currentPlayingSound && currentQueue.length > 0) {
      // Sound has ended, play next after a small delay
      const timer = setTimeout(() => {
        playNextInQueue();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isSequentialMode, currentPlayingSound, currentQueue.length, playNextInQueue]);

  const getCurrentSoundInQueue = useCallback(() => {
    if (!isSequentialMode || currentIndex >= currentQueue.length) return null;
    return currentQueue[currentIndex - 1]; // -1 because we increment before playing
  }, [isSequentialMode, currentIndex, currentQueue]);

  const getQueueInfo = useCallback(() => {
    if (!isSequentialMode) return null;
    return {
      current: Math.max(0, currentIndex - 1),
      total: currentQueue.length,
      category: currentQueue[0]?.category || ''
    };
  }, [isSequentialMode, currentIndex, currentQueue]);

  return {
    isSequentialMode,
    startSequentialPlay,
    stopSequentialPlay,
    getCurrentSoundInQueue,
    getQueueInfo
  };
};
