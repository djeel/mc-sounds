
import React from 'react';
import { Square } from 'lucide-react';

interface SequentialPlayerProps {
  isVisible: boolean;
  queueInfo: {
    current: number;
    total: number;
    category: string;
  } | null;
  onStop: () => void;
}

const SequentialPlayer: React.FC<SequentialPlayerProps> = ({
  isVisible,
  queueInfo,
  onStop,
}) => {
  if (!isVisible || !queueInfo) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 animate-fade-in">
      <div className="minecraft-button bg-card border-modrinth-green-500 p-4 min-w-[250px] shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Playing Category</p>
            <p className="text-sm font-medium text-foreground capitalize mb-1">
              {queueInfo.category}
            </p>
            <p className="text-xs text-muted-foreground">
              {queueInfo.current + 1} of {queueInfo.total} sounds
            </p>
          </div>
          
          <button
            onClick={onStop}
            className="minecraft-button p-2 bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive"
            aria-label="Stop sequential playback"
          >
            <Square className="w-4 h-4" fill="currentColor" />
          </button>
        </div>
        
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-modrinth-green-500 transition-all duration-300" 
              style={{ width: `${((queueInfo.current + 1) / queueInfo.total) * 100}%` }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequentialPlayer;
