import { usePixel } from '../../state/PixelContext.jsx';
import styles from './LeftSidebar.module.css';

const PALETTE_COLORS = [
  { name: 'red', hex: '#e74c3c' },
  { name: 'orange', hex: '#e67e22' },
  { name: 'yellow', hex: '#f1c40f' },
  { name: 'green', hex: '#2ecc71' },
  { name: 'blue', hex: '#3498db' },
  { name: 'darkblue', hex: '#2c3e8c' },
  { name: 'purple', hex: '#9b59b6' },
  { name: 'pink', hex: '#e84393' },
  { name: 'teal', hex: '#00cec9' },
  { name: 'lightgray', hex: '#dfe6e9' },
];

const COMMAND_EXAMPLES = [
  { parts: [{ text: 'place ', keyword: true }, { text: 'red at B3' }] },
  { parts: [{ text: 'fill ', keyword: true }, { text: 'blue C2→E3' }] },
  { parts: [{ text: 'draw line ', keyword: true }, { text: 'from A1 to D4' }] },
  { parts: [{ text: 'erase ', keyword: true }, { text: 'B3' }] },
  { parts: [{ text: 'undo', keyword: true }] },
  { parts: [{ text: 'clear', keyword: true }] },
];

export function LeftSidebar() {
  const { state, dispatch } = usePixel();
  const { activeColor, gridCols, gridRows } = state;

  return (
    <aside className={styles.sidebar}>
      {/* Color palette */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Color</div>
        <div className={styles.palette}>
          {PALETTE_COLORS.map(({ name, hex }) => (
            <button
              key={name}
              className={`${styles.swatch} ${activeColor === name ? styles.active : ''}`}
              style={{ backgroundColor: hex }}
              onClick={() => dispatch({ type: 'SET_COLOR', color: name })}
              title={name}
              aria-label={`Set color to ${name}`}
            />
          ))}
        </div>
        <div className={styles.colorName}>{activeColor}</div>
      </div>

      {/* Command reference */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Commands</div>
        <div className={styles.commandList}>
          {COMMAND_EXAMPLES.map((cmd, i) => (
            <div key={i} className={styles.commandChip}>
              {cmd.parts.map((part, j) =>
                part.keyword
                  ? <span key={j} className={styles.keyword}>{part.text}</span>
                  : <span key={j}>{part.text}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grid info */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Grid</div>
        <div className={styles.gridInfoText}>{gridCols} × {gridRows} cells</div>
      </div>
    </aside>
  );
}
