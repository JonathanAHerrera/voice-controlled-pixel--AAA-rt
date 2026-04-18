import { pipeline, env } from '@xenova/transformers';

// Use the CDN — don't look for local models
env.allowLocalModels = false;
env.useBrowserCache = true;

let transcriber = null;

async function getTranscriber() {
  if (!transcriber) {
    self.postMessage({ type: 'status', status: 'loading' });
    transcriber = await pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-tiny.en',
    );
  }
  return transcriber;
}

self.onmessage = async (event) => {
  const { type, audio } = event.data;
  if (type !== 'transcribe') return;

  try {
    const t = await getTranscriber();
    self.postMessage({ type: 'status', status: 'processing' });

    const result = await t(audio, {
      language: 'english',
      task: 'transcribe',
    });

    const transcript = result.text.trim();
    self.postMessage({ type: 'result', transcript });
  } catch (err) {
    self.postMessage({ type: 'error', error: err.message });
  }
};
