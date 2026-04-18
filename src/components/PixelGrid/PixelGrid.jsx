import { Fragment } from 'react';
import { usePixel } from '../../state/PixelContext.jsx';
import { PixelCell } from './PixelCell.jsx';
import styles from './PixelGrid.module.css';

export function PixelGrid() {
  const { state } = usePixel();
  const { cells, gridCols, gridRows } = state;

  const colLetters = Array.from({ length: gridCols }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.gridContainer}
        style={{
          gridTemplateColumns: `24px repeat(${gridCols}, var(--cell-size))`,
          gridTemplateRows: `24px repeat(${gridRows}, var(--cell-size))`,
        }}
      >
        {/* Top-left corner */}
        <div className={styles.corner} />

        {/* Column labels */}
        {colLetters.map(letter => (
          <div key={letter} className={styles.colLabel}>{letter}</div>
        ))}

        {/* Rows */}
        {cells.map((row, rowIdx) => (
          <Fragment key={rowIdx}>
            <div className={styles.rowLabel}>{rowIdx + 1}</div>
            {row.map((color, colIdx) => (
              <PixelCell
                key={`${colIdx}-${rowIdx}`}
                col={colIdx}
                row={rowIdx}
                color={color}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
