class BinauralEngine {
  constructor() {
    this.ctx = null;
    this.nodes = {};
    this.playing = false;
  }

  async _ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  // Frequency presets based on brainwave research
  static PRESETS = {
    deepRelax: {
      name: 'Deep Relaxation',
      description: 'Theta waves (6 Hz) — deep calm and meditation',
      baseFreq: 200,
      beatFreq: 6,
      icon: '🌊'
    },
    calmFocus: {
      name: 'Calm Focus',
      description: 'Alpha waves (10 Hz) — relaxed alertness',
      baseFreq: 220,
      beatFreq: 10,
      icon: '🧘'
    },
    deepSleep: {
      name: 'Deep Sleep',
      description: 'Delta waves (2 Hz) — restorative rest',
      baseFreq: 180,
      beatFreq: 2,
      icon: '🌙'
    },
    stressRelief: {
      name: 'Stress Relief',
      description: 'Alpha-Theta border (8 Hz) — anxiety reduction',
      baseFreq: 210,
      beatFreq: 8,
      icon: '✨'
    },
    gammaClarity: {
      name: 'Mental Clarity',
      description: 'Low Gamma (40 Hz) — heightened awareness',
      baseFreq: 240,
      beatFreq: 40,
      icon: '💡'
    }
  };

  async play(presetKey, volume = 0.5) {
    await this._ensureContext();
    this.stop();

    const preset = BinauralEngine.PRESETS[presetKey];
    if (!preset) return;

    const { baseFreq, beatFreq } = preset;

    // Left ear oscillator
    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.value = baseFreq;

    // Right ear oscillator (offset by beat frequency)
    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.value = baseFreq + beatFreq;

    // Stereo panning
    const panL = this.ctx.createStereoPanner();
    panL.pan.value = -1;
    const panR = this.ctx.createStereoPanner();
    panR.pan.value = 1;

    // Master gain with fade-in
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 2);

    // Background ambient noise (pink-ish) for smoother experience
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = volume * 0.15;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = noiseBuffer.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
      }
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Connect graph
    oscL.connect(panL).connect(gain).connect(this.ctx.destination);
    oscR.connect(panR).connect(gain).connect(this.ctx.destination);
    noise.connect(noiseGain).connect(this.ctx.destination);

    oscL.start();
    oscR.start();
    noise.start();

    this.nodes = { oscL, oscR, panL, panR, gain, noise, noiseGain };
    this.playing = true;
    this.currentPreset = presetKey;

    // Start silent audio to keep iOS audio session alive across screen lock
    _startSilentAudio();
  }

  setVolume(vol) {
    if (this.nodes.gain) {
      this.nodes.gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.3);
    }
    if (this.nodes.noiseGain) {
      this.nodes.noiseGain.gain.linearRampToValueAtTime(vol * 0.15, this.ctx.currentTime + 0.3);
    }
  }

  stop() {
    if (!this.playing) return;
    const oldNodes = this.nodes;
    this.nodes = {};
    this.playing = false;
    this.currentPreset = null;
    try {
      if (oldNodes.gain) {
        oldNodes.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
      }
      if (oldNodes.noiseGain) {
        oldNodes.noiseGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
      }
      setTimeout(() => {
        ['oscL', 'oscR', 'noise'].forEach(k => {
          try { oldNodes[k]?.stop(); } catch {}
        });
      }, 1200);
    } catch {}
  }
}

const binauralEngine = new BinauralEngine();

// ===== KEEP AUDIO ALIVE (screen lock / visibility change) =====

// Silent audio element — keeps iOS audio session active when screen locks
const _silentAudio = document.createElement('audio');
_silentAudio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
_silentAudio.loop = true;
_silentAudio.volume = 0.001;

function _startSilentAudio() {
  _silentAudio.play().catch(() => {});
}

// Resume AudioContext and silent audio when page becomes visible again
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && binauralEngine.playing) {
    binauralEngine.ctx?.resume();
    _startSilentAudio();
  }
});

// Handle AudioContext being suspended by the browser mid-playback
setInterval(() => {
  if (binauralEngine.playing && binauralEngine.ctx?.state === 'suspended') {
    binauralEngine.ctx.resume();
  }
}, 1000);

// Set up MediaSession so the OS treats this as a media app (prevents audio interruption)
if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: 'Stress Reset',
    artist: 'Binaural Beats',
    album: 'Stress Reset App'
  });
  navigator.mediaSession.setActionHandler('play', () => {
    binauralEngine.ctx?.resume();
  });
  navigator.mediaSession.setActionHandler('pause', () => {});
}
