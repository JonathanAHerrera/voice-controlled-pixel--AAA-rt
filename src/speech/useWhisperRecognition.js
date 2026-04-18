import { useRef, useCallback } from 'react';

// Module-level singleton — model loads once, persists across re-renders
let transcriberPromise = null;

async function getTranscriber(onProgress) {
  if (!transcriberPromise) {
    // Dynamic import avoids Vite bundling onnxruntime-web incorrectly
    const { pipeline, env } = await import('@huggingface/transformers');
    env.allowLocalModels = false;
    env.useBrowserCache = true;
    transcriberPromise = pipeline(
      'automatic-speech-recognition',
      'onnx-community/whisper-tiny.en',
      {
        dtype: 'q4',           // 4-bit quantized — smallest/fastest variant
        progress_callback: onProgress,
      }
    );
  }
  return transcriberPromise;
}

export function useWhisperRecognition({ onResult, onStatusChange }) {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const isListeningRef = useRef(false);

  // Always-current callback refs — no stale closures
  const onResultRef = useRef(onResult);
  const onStatusChangeRef = useRef(onStatusChange);
  onResultRef.current = onResult;
  onStatusChangeRef.current = onStatusChange;

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach(t => t.stop());

        onStatusChangeRef.current('loading');

        try {
          // Decode audio and resample to 16kHz mono (Whisper's expected format)
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const arrayBuffer = await blob.arrayBuffer();
          const audioCtx = new AudioContext();
          const decoded = await audioCtx.decodeAudioData(arrayBuffer);
          audioCtx.close();

          const targetRate = 16000;
          const offlineCtx = new OfflineAudioContext(
            1,
            Math.ceil(decoded.duration * targetRate),
            targetRate
          );
          const source = offlineCtx.createBufferSource();
          source.buffer = decoded;
          source.connect(offlineCtx.destination);
          source.start(0);
          const resampled = await offlineCtx.startRendering();
          const float32 = resampled.getChannelData(0);

          onStatusChangeRef.current('processing');

          const transcriber = await getTranscriber();
          const result = await transcriber(float32);

          const transcript = result.text.trim();
          onStatusChangeRef.current('recognized', transcript);
          onResultRef.current(transcript);
          setTimeout(() => onStatusChangeRef.current('idle'), 1500);
        } catch (err) {
          console.error('Transcription error:', err);
          onStatusChangeRef.current('error');
        }
      };

      recorder.start();
      isListeningRef.current = true;
      onStatusChangeRef.current('listening');
    } catch (err) {
      console.error('Mic access error:', err);
      onStatusChangeRef.current('error');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!isListeningRef.current) return;
    isListeningRef.current = false;
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      onStatusChangeRef.current('processing');
    }
  }, []);

  return { startListening, stopListening };
}
