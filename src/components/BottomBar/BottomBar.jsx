import { useState } from 'react';
import { usePixel } from '../../state/PixelContext.jsx';
import { useWhisperRecognition } from '../../speech/useWhisperRecognition.js';
import styles from './BottomBar.module.css';

const MIC_ICON = {
  idle: '🎤',
  listening: '⏹',   // click to stop recording
  processing: '⏳',
  loading: '⏳',
  recognized: '✓',
  error: '⚠',
};

export function BottomBar() {
  const { state, dispatch, executeCommand } = usePixel();
  const [inputValue, setInputValue] = useState('');

  const { startListening, stopListening } = useWhisperRecognition({
    onResult: (transcript) => {
      setInputValue(transcript);
      executeCommand(transcript);
    },
    onStatusChange: (status, transcript) => {
      dispatch({
        type: 'SET_VOICE_STATUS',
        status,
        transcript: transcript ?? undefined,
      });
    },
  });

  const { listeningStatus } = state;
  const isListening = listeningStatus === 'listening';
  const isBusy = listeningStatus === 'processing' || listeningStatus === 'loading';

  function handleRun() {
    if (!inputValue.trim()) return;
    executeCommand(inputValue.trim());
    setInputValue('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleRun();
  }

  function handleMicClick() {
    if (isListening) {
      stopListening();
    } else if (!isBusy) {
      startListening();
    }
  }

  return (
    <div className={styles.bar}>
      <button
        className={`${styles.micBtn} ${isListening ? styles.listening : ''} ${isBusy ? styles.busy : ''}`}
        onClick={handleMicClick}
        disabled={isBusy}
        title={
          isBusy ? 'Processing...'
          : isListening ? 'Click to stop recording'
          : 'Click to start voice input'
        }
        aria-label="Toggle voice input"
      >
        {MIC_ICON[listeningStatus] ?? '🎤'}
      </button>

      <div className={styles.inputWrapper}>
        <input
          className={styles.input}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='e.g. place red at B3 · draw line from A1 to D4 · fill blue C2 to E3'
          aria-label="Command input"
          spellCheck={false}
        />
      </div>

      <button
        className={styles.runBtn}
        onClick={handleRun}
        disabled={!inputValue.trim()}
      >
        run
      </button>
    </div>
  );
}
