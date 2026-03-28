class StressResetSession {
  // 15-minute guided session structure (in seconds)
  static PHASES = [
    { name: 'Settle In', duration: 60, description: 'Close your eyes. Let your shoulders drop. You\'re safe here.', audio: 'deepRelax', breathing: null },
    { name: 'Physiological Sighs', duration: 120, description: 'Double inhale through the nose, long exhale through the mouth. The fastest way to calm your nervous system.', audio: 'stressRelief', breathing: 'physiologicalSigh' },
    { name: 'Deep Breathing', duration: 180, description: 'Slow 4-7-8 breathing. Each cycle activates your parasympathetic nervous system.', audio: 'stressRelief', breathing: 'fourSevenEight' },
    { name: 'Theta Entrainment', duration: 180, description: 'Let the binaural beats guide your brain into theta state. Simply listen and breathe naturally.', audio: 'deepRelax', breathing: null },
    { name: 'Box Breathing', duration: 180, description: 'Equal box breathing for balance and control. In-hold-out-hold, each for 4 counts.', audio: 'calmFocus', breathing: 'box' },
    { name: 'Alpha Restoration', duration: 120, description: 'Alpha waves restore calm alertness. You\'re becoming centered and clear.', audio: 'calmFocus', breathing: 'extendedExhale' },
    { name: 'Integration', duration: 60, description: 'Notice how you feel. The calm you\'ve built is yours to carry forward.', audio: 'calmFocus', breathing: null }
  ];

  constructor(onUpdate, onPhaseChange, onComplete) {
    this.onUpdate = onUpdate;
    this.onPhaseChange = onPhaseChange;
    this.onComplete = onComplete;
    this.running = false;
    this.paused = false;
    this.timer = null;
    this.totalDuration = StressResetSession.PHASES.reduce((a, p) => a + p.duration, 0);
  }

  start() {
    this.running = true;
    this.paused = false;
    this.phaseIndex = 0;
    this.phaseElapsed = 0;
    this.globalElapsed = 0;
    this._startPhase();
  }

  _startPhase() {
    if (!this.running || this.phaseIndex >= StressResetSession.PHASES.length) {
      this._complete();
      return;
    }

    const phase = StressResetSession.PHASES[this.phaseIndex];
    this.phaseElapsed = 0;

    if (this.onPhaseChange) {
      this.onPhaseChange(phase, this.phaseIndex, StressResetSession.PHASES.length);
    }

    this._tick();
  }

  _tick() {
    if (!this.running) return;

    const phase = StressResetSession.PHASES[this.phaseIndex];
    const tickMs = 200;

    this.timer = setInterval(() => {
      if (this.paused) return;

      this.phaseElapsed += tickMs / 1000;
      this.globalElapsed += tickMs / 1000;

      if (this.onUpdate) {
        this.onUpdate({
          phase,
          phaseIndex: this.phaseIndex,
          totalPhases: StressResetSession.PHASES.length,
          phaseProgress: this.phaseElapsed / phase.duration,
          globalProgress: this.globalElapsed / this.totalDuration,
          globalRemaining: this.totalDuration - this.globalElapsed,
          phaseRemaining: phase.duration - this.phaseElapsed
        });
      }

      if (this.phaseElapsed >= phase.duration) {
        clearInterval(this.timer);
        this.phaseIndex++;
        this._startPhase();
      }
    }, tickMs);
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  togglePause() {
    this.paused = !this.paused;
    return this.paused;
  }

  stop() {
    this.running = false;
    this.paused = false;
    clearInterval(this.timer);
  }

  _complete() {
    this.running = false;
    clearInterval(this.timer);
    if (this.onComplete) this.onComplete(this.globalElapsed);
  }

  get isRunning() { return this.running; }
  get isPaused() { return this.paused; }
}
