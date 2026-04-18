import { usePixel } from '../../state/PixelContext.jsx';
import { formatCoord } from '../../engine/coordinateUtils.js';
import styles from './PixelGrid.module.css';

const COLOR_MAP = {
  red: '#e74c3c',
  orange: '#e67e22',
  yellow: '#f1c40f',
  green: '#2ecc71',
  blue: '#3498db',
  darkblue: '#2c3e8c',
  purple: '#9b59b6',
  pink: '#e84393',
  teal: '#00cec9',
  lightgray: '#dfe6e9',
  black: '#2d3436',
  white: '#ffffff',
};

export function PixelCell({ col, row, color }) {
  const { state, dispatch } = usePixel();
  const label = formatCoord(col, row);
  const bg = color ? (COLOR_MAP[color] ?? color) : null;

  function handleClick() {
    if (color) {
      dispatch({ type: 'ERASE', col, row, commandText: `erase ${label}` });
    } else {
      dispatch({
        type: 'PLACE',
        col,
        row,
        color: state.activeColor,
        commandText: `place ${state.activeColor} at ${label}`,
      });
    }
  }

  return (
    <div
      className={styles.cell}
      style={bg ? { backgroundColor: bg } : undefined}
      onClick={handleClick}
      title={color ? `${label} · ${color}` : label}
      role="button"
      aria-label={color ? `${label}: ${color}` : `${label}: empty`}
    />
  );
}
