import { Audio } from 'expo-av';

export interface BinauralPreset {
  name: string;
  description: string;
  baseFreq: number;
  beatFreq: number;
  icon: string;
}

export const PRESETS: Record<string, BinauralPreset> = {
  deepRelax: {
    name: 'Deep Relaxation',
    description: 'Theta waves (6 Hz) — deep calm and meditation',
    baseFreq: 200,
    beatFreq: 6,
    icon: '🌊',
  },
  calmFocus: {
    name: 'Calm Focus',
    description: 'Alpha waves (10 Hz) — relaxed alertness',
    baseFreq: 220,
    beatFreq: 10,
    icon: '🧘',
  },
  deepSleep: {
    name: 'Deep Sleep',
    description: 'Delta waves (2 Hz) — restorative rest',
    baseFreq: 180,
    beatFreq: 2,
    icon: '🌙',
  },
  stressRelief: {
    name: 'Stress Relief',
    description: 'Alpha-Theta border (8 Hz) — anxiety reduction',
    baseFreq: 210,
    beatFreq: 8,
    icon: '✨',
  },
  gammaClarity: {
    name: 'Mental Clarity',
    description: 'Low Gamma (40 Hz) — heightened awareness',
    baseFreq: 240,
    beatFreq: 40,
    icon: '💡',
  },
};

const SAMPLE_RATE = 44100;
const DURATION_SEC = 30; // Loop a 30s buffer
const NUM_SAMPLES = SAMPLE_RATE * DURATION_SEC;

function generateBinauralWav(baseFreq: number, beatFreq: number, volume: number): string {
  const numChannels = 2;
  const bitsPerSample = 16;
  const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = NUM_SAMPLES * numChannels * (bitsPerSample / 8);
  const fileSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Generate stereo binaural beat samples
  const freqL = baseFreq;
  const freqR = baseFreq + beatFreq;
  const amp = Math.min(volume, 1) * 0.4 * 32767; // Keep amplitude moderate

  let offset = 44;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    // Fade in first 2 seconds, fade out last 0.5 seconds for seamless loop
    let envelope = 1;
    if (t < 2) envelope = t / 2;
    if (t > DURATION_SEC - 0.5) envelope = (DURATION_SEC - t) / 0.5;

    const sampleL = Math.sin(2 * Math.PI * freqL * t) * amp * envelope;
    const sampleR = Math.sin(2 * Math.PI * freqR * t) * amp * envelope;

    // Add subtle pink noise
    const noise = (Math.random() * 2 - 1) * amp * 0.08 * envelope;

    view.setInt16(offset, clamp16(sampleL + noise), true);
    offset += 2;
    view.setInt16(offset, clamp16(sampleR + noise), true);
    offset += 2;
  }

  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function clamp16(val: number): number {
  return Math.max(-32768, Math.min(32767, Math.round(val)));
}

class BinauralEngine {
  private sound: Audio.Sound | null = null;
  private currentPreset: string | null = null;
  playing = false;

  async play(presetKey: string, volume = 0.5) {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    await this.stop();

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    const base64Wav = generateBinauralWav(preset.baseFreq, preset.beatFreq, volume);

    const { sound } = await Audio.Sound.createAsync(
      { uri: `data:audio/wav;base64,${base64Wav}` },
      { isLooping: true, volume, shouldPlay: true }
    );

    this.sound = sound;
    this.currentPreset = presetKey;
    this.playing = true;
  }

  async setVolume(vol: number) {
    if (this.sound) {
      await this.sound.setVolumeAsync(vol);
    }
  }

  async stop() {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch {}
      this.sound = null;
    }
    this.playing = false;
    this.currentPreset = null;
  }
}

export const binauralEngine = new BinauralEngine();
