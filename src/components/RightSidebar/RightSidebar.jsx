import { usePixel } from '../../state/PixelContext.jsx';
import styles from './RightSidebar.module.css';

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function HistoryPanel({ history }) {
  if (history.length === 0) {
    return <div style={{ fontSize: 12, color: 'var(--text-label)' }}>No commands yet</div>;
  }
  return (
    <div className={styles.historyList}>
      {history.map((item, i) => (
        <div key={item.id} className={`${styles.historyItem} ${i === 0 ? styles.latest : ''}`}>
          <div className={styles.historyCommand}>{item.commandText || item.description}</div>
          <div className={styles.historyMeta}>{item.description} · {timeAgo(item.timestamp)}</div>
        </div>
      ))}
    </div>
  );
}

function VoiceFeedback({ listeningStatus, lastTranscript }) {
  const isActive = listeningStatus === 'listening' || listeningStatus === 'recognized';
  return (
    <div className={styles.voiceFeedback}>
      <div className={styles.waveform}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className={`${styles.waveBar} ${isActive ? '' : styles.idle}`} />
        ))}
        <span className={styles.voiceStatus} style={{ marginLeft: 8 }}>
          {listeningStatus}
        </span>
      </div>
      {lastTranscript && (
        <div className={styles.voiceTranscript}>"{lastTranscript}"</div>
      )}
    </div>
  );
}

export function RightSidebar() {
  const { state } = usePixel();
  const { history, listeningStatus, lastTranscript, lastError } = state;

  return (
    <aside className={styles.sidebar}>
      {lastError && (
        <div className={styles.errorBanner}>{lastError}</div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionTitle}>History</div>
        <HistoryPanel history={history} />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Voice Feedback</div>
        <VoiceFeedback listeningStatus={listeningStatus} lastTranscript={lastTranscript} />
      </div>
    </aside>
  );
}
