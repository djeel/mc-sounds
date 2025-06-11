import React from 'react';
import { FixedSizeGrid as Grid, GridChildComponentProps } from 'react-window';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';

interface VirtualizedSoundGridProps {
  sounds: any[];
  columnCount: number;
  rowHeight: number;
  columnWidth: number;
  renderDraggable: (sound: any, idx: number, cellStyle: React.CSSProperties, columnIndex: number) => React.ReactNode;
}

const VirtualizedSoundGrid: React.FC<VirtualizedSoundGridProps> = ({
  sounds,
  columnCount,
  rowHeight,
  columnWidth,
  renderDraggable,
}) => {
  const rowCount = Math.ceil(sounds.length / columnCount);

  const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    const idx = rowIndex * columnCount + columnIndex;
    if (idx >= sounds.length) return null;
    // On applique le style react-window sur le conteneur racine
    return (
      <div style={{ ...style, boxSizing: 'border-box' }}>
        {renderDraggable(sounds[idx], idx, { width: '100%', height: '100%' }, columnIndex)}
      </div>
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
