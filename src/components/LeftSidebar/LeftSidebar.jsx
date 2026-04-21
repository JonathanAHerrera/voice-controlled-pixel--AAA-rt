import { usePixel } from '../../state/PixelContext.jsx';
import styles from './LeftSidebar.module.css';

const COLOR_HEX = {
  red: '#e74c3c', orange: '#e67e22', yellow: '#f1c40f', green: '#2ecc71',
  blue: '#3498db', darkblue: '#2c3e8c', purple: '#9b59b6', pink: '#e84393',
  teal: '#00cec9', lightgray: '#dfe6e9', black: '#2d3436', white: '#ffffff',
};

const COMMAND_EXAMPLES = [
  { parts: [{ text: 'place ', keyword: true }, { text: 'red at B3' }] },
  { parts: [{ text: 'fill ', keyword: true }, { text: 'blue C2→E3' }] },
  { parts: [{ text: 'draw line ', keyword: true }, { text: 'from A1 to D4' }] },
  { parts: [{ text: 'erase ', keyword: true }, { text: 'B3' }] },
  { parts: [{ text: 'select ', keyword: true }, { text: 'red' }] },
  { parts: [{ text: 'load palette ', keyword: true }, { text: 'earth' }] },
  { parts: [{ text: 'new palette ', keyword: true }, { text: 'mypal' }] },
  { parts: [{ text: 'add ', keyword: true }, { text: 'blue ' }, { text: 'to palette', keyword: true }] },
  { parts: [{ text: 'remove ', keyword: true }, { text: 'blue ' }, { text: 'from palette', keyword: true }] },
  { parts: [{ text: 'save palette ', keyword: true }, { text: 'mypal' }] },
  { parts: [{ text: 'delete palette ', keyword: true }, { text: 'mypal' }] },
  { parts: [{ text: 'undo', keyword: true }] },
  { parts: [{ text: 'clear', keyword: true }] },
];

export function LeftSidebar() {
  const { state, dispatch } = usePixel();
  const { activeColor, activePalette, palettes, gridCols, gridRows } = state;
  const paletteColors = palettes[activePalette] ?? [];
  const paletteNames = Object.keys(palettes);

  return (
    <aside className={styles.sidebar}>
      {/* Color palette */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>Color</div>
          <div className={styles.paletteName}>{activePalette}</div>
        </div>
        <div className={styles.palette}>
          {paletteColors.map((name) => (
            <button
              key={name}
              className={`${styles.swatch} ${activeColor === name ? styles.active : ''}`}
              style={{ backgroundColor: COLOR_HEX[name] ?? name }}
              onClick={() => dispatch({ type: 'SET_COLOR', color: name })}
              title={name}
              aria-label={`Set color to ${name}`}
            />
          ))}
        </div>
        <div className={styles.colorName}>{activeColor}</div>
      </div>

      {/* Palette switcher */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Palettes</div>
        <div className={styles.paletteList}>
          {paletteNames.map((name) => (
            <button
              key={name}
              className={`${styles.paletteChip} ${activePalette === name ? styles.paletteChipActive : ''}`}
              onClick={() => dispatch({ type: 'LOAD_PALETTE', name })}
            >
              <span className={styles.paletteChipDots}>
                {(palettes[name] ?? []).slice(0, 5).map((c) => (
                  <span
                    key={c}
                    className={styles.paletteDot}
                    style={{ backgroundColor: COLOR_HEX[c] ?? c }}
                  />
                ))}
              </span>
              {name}
            </button>
          ))}
        </div>
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
