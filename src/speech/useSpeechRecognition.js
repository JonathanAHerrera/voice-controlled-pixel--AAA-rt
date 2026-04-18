import { useRef, useCallback } from 'react';

export function useSpeechRecognition({ onResult, onStatusChange }) {
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  // Always-current callback refs — no stale closures
  const onResultRef = useRef(onResult);
  const onStatusChangeRef = useRef(onStatusChange);
  onResultRef.current = onResult;
  onStatusChangeRef.current = onStatusChange;

  const supported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Defined as a ref so it can reference itself for restart logic
  const startSession = useRef(null);
  startSession.current = () => {
    if (!supported || !isListeningRef.current) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.trim();
        onStatusChangeRef.current('recognized', transcript);
        onResultRef.current(transcript);
        setTimeout(() => {
          if (isListeningRef.current) onStatusChangeRef.current('listening');
        }, 1200);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return; // silence — not an error
      if (event.error === 'aborted') return;   // we called abort() — expected
      console.warn('Speech recognition error:', event.error);
      onStatusChangeRef.current('error', '');
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      // Create a brand-new instance instead of reusing — avoids browser quirks
      if (isListeningRef.current) {
        setTimeout(() => startSession.current(), 100);
      } else {
        onStatusChangeRef.current('idle');
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.warn('recognition.start() failed:', e);
    }
  };

  const startListening = useCallback(() => {
    if (!supported) return;
    isListeningRef.current = true;
    onStatusChangeRef.current('listening');
    startSession.current();
  }, [supported]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
  }, []);

  return { supported, startListening, stopListening };
}
