import React from 'react';
import { FixedSizeGrid as Grid, GridChildComponentProps } from 'react-window';

interface VirtualizedSoundGridProps {
  sounds: any[];
  columnCount: number;
  rowHeight: number;
  columnWidth: number;
  renderSound: (sound: any, idx: number) => React.ReactNode;
}

const VirtualizedSoundGrid: React.FC<VirtualizedSoundGridProps> = ({
  sounds,
  columnCount,
  rowHeight,
  columnWidth,
  renderSound,
}) => {
  const rowCount = Math.ceil(sounds.length / columnCount);

  const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    const idx = rowIndex * columnCount + columnIndex;
    if (idx >= sounds.length) return null;
    // On force la taille de la cellule pour garantir une hauteur et largeur fixes
    const cellStyle = {
      ...style,
      left: style.left,
      top: style.top,
      width: columnWidth,
      height: rowHeight,
      paddingLeft: columnIndex === 0 ? 0 : 16,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'stretch',
    };
    return (
      <div style={cellStyle}>
        <div style={{ width: '100%', height: '100%' }}>
          {renderSound(sounds[idx], idx)}
        </div>
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
