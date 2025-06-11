import React from 'react';
import { FixedSizeGrid as Grid, GridChildComponentProps } from 'react-window';
import { Draggable } from '@hello-pangea/dnd';
import SoundCard from './SoundCard';

interface VirtualizedSoundGridProps {
  sounds: any[];
  columnCount: number;
  rowHeight: number;
  columnWidth: number;
  isPlaying: (soundId: string) => boolean;
  isFavorite: (soundId: string) => boolean;
  onPlay: (soundPath: string, soundId: string) => void;
  onToggleFavorite: (soundId: string) => void;
  isPaused: boolean; // Ajouté pour synchroniser l'état pause
}

const VirtualizedSoundGrid: React.FC<VirtualizedSoundGridProps> = ({
  sounds,
  columnCount,
  rowHeight,
  columnWidth,
  isPlaying,
  isFavorite,
  onPlay,
  onToggleFavorite,
  isPaused, // Ajouté
}) => {
  const rowCount = Math.ceil(sounds.length / columnCount);

  const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    const idx = rowIndex * columnCount + columnIndex;
    if (idx >= sounds.length) return null;
    const sound = sounds[idx];
    return (
      <Draggable draggableId={sound.id} index={idx} key={sound.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{ ...style, boxSizing: 'border-box', padding: 6, ...provided.draggableProps.style }}
            data-sound-id={sound.id}
          >
            <SoundCard
              soundId={sound.id}
              soundName={sound.name}
              soundPath={sound.path}
              category={sound.category}
              isPlaying={isPlaying(sound.id)}
              isFavorite={isFavorite(sound.id)}
              onPlay={onPlay}
              onToggleFavorite={onToggleFavorite}
              isPaused={isPaused} // Ajouté
            />
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <Grid
      columnCount={columnCount}
      columnWidth={columnWidth}
      height={rowHeight * Math.min(rowCount, 6)}
      rowCount={rowCount}
      rowHeight={rowHeight}
      width={columnWidth * columnCount + 16}
    >
      {Cell}
    </Grid>
  );
};

export default VirtualizedSoundGrid;
