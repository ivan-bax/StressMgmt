const Haptics = {
  _supported: 'vibrate' in navigator,

  _vibrate(pattern) {
    if (this._supported) {
      try { navigator.vibrate(pattern); } catch {}
    }
  },

  // Called at the start of each breathing phase
  phaseStart(action) {
    const a = action.toLowerCase();
    if (a.includes('in')) {
      // Two short pulses = inhale start
      this._vibrate([30, 60, 30]);
    } else if (a.includes('out') || a.includes('exhale')) {
      // One long pulse = exhale start
      this._vibrate([80]);
    } else if (a.includes('hold')) {
      // Faint single tick = hold
      this._vibrate([15]);
    }
  },

  // Called every second during a phase (the count ticking down)
  count(action) {
    const a = action.toLowerCase();
    if (a.includes('hold')) return; // no per-second vibration during hold
    this._vibrate([20]);
  }
};
