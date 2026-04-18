import { usePixel } from '../../state/PixelContext.jsx';
import styles from './HeaderBar.module.css';

const STATUS_LABELS = {
  idle: 'idle',
  listening: 'listening',
  recognized: 'recognized',
  error: 'error',
};

export function HeaderBar() {
  const { state, dispatch } = usePixel();
  const { listeningStatus, undoStack } = state;

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.title}>PixelVoice</span>
        <div className={styles.statusBadge}>
          <span className={`${styles.dot} ${styles[listeningStatus]}`} />
          <span>{STATUS_LABELS[listeningStatus]}</span>
        </div>
      </div>
      <button
        className={styles.undoBtn}
        onClick={() => dispatch({ type: 'UNDO' })}
        disabled={undoStack.length === 0}
        title="Undo last action"
      >
        ↩ undo
      </button>
    </header>
  );
}
