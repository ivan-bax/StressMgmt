class BreathingExercise {
  static EXERCISES = {
    box: {
      name: 'Box Breathing',
      description: 'Equal phases of inhale, hold, exhale, hold. Used by Navy SEALs for instant calm.',
      phases: [
        { action: 'Breathe In', duration: 4 },
        { action: 'Hold', duration: 4 },
        { action: 'Breathe Out', duration: 4 },
        { action: 'Hold', duration: 4 }
      ],
      color: '#4fc3f7'
    },
    fourSevenEight: {
      name: '4-7-8 Breathing',
      description: 'Dr. Andrew Weil\'s technique. Activates the parasympathetic nervous system.',
      phases: [
        { action: 'Breathe In', duration: 4 },
        { action: 'Hold', duration: 7 },
        { action: 'Breathe Out', duration: 8 }
      ],
      color: '#81c784'
    },
    extendedExhale: {
      name: 'Extended Exhale',
      description: 'Longer exhale than inhale. Stimulates the vagus nerve for rapid calming.',
      phases: [
        { action: 'Breathe In', duration: 4 },
        { action: 'Breathe Out', duration: 8 }
      ],
      color: '#ce93d8'
    },
    physiologicalSigh: {
      name: 'Physiological Sigh',
      description: 'Double inhale + long exhale. Huberman Lab\'s top recommendation for real-time stress relief.',
      phases: [
        { action: 'Inhale', duration: 2 },
        { action: 'Inhale More', duration: 2 },
        { action: 'Long Exhale', duration: 6 }
      ],
      color: '#ffb74d'
    }
  };

  constructor(onUpdate, onCycleComplete) {
    this.onUpdate = onUpdate;
    this.onCycleComplete = onCycleComplete;
    this.running = false;
    this.timer = null;
    this.cycles = 0;
  }

  start(exerciseKey, totalCycles = Infinity) {
    this.exercise = BreathingExercise.EXERCISES[exerciseKey];
    if (!this.exercise) return;
    this.running = true;
    this.cycles = 0;
    this.targetCycles = totalCycles;
    this.phaseIndex = 0;
    this.elapsed = 0;
    this._runPhase();
  }

  _runPhase() {
    if (!this.running) return;

    const phase = this.exercise.phases[this.phaseIndex];
    const totalMs = phase.duration * 1000;
    this.elapsed = 0;
    this._lastVibCount = -1;

    // Vibrate on phase start
    Haptics.phaseStart(phase.action);

    this.onUpdate({
      action: phase.action,
      duration: phase.duration,
      progress: 0,
      phaseIndex: this.phaseIndex,
      totalPhases: this.exercise.phases.length,
      cycles: this.cycles,
      color: this.exercise.color
    });

    const tick = 50;
    this.timer = setInterval(() => {
      this.elapsed += tick;
      const progress = Math.min(this.elapsed / totalMs, 1);
      const remaining = Math.ceil((totalMs - this.elapsed) / 1000);

      // Vibrate once per second count change (only on inhale/exhale, not hold)
      if (remaining !== this._lastVibCount) {
        this._lastVibCount = remaining;
        Haptics.count(phase.action);
      }

      this.onUpdate({
        action: phase.action,
        duration: phase.duration,
        progress,
        phaseIndex: this.phaseIndex,
        totalPhases: this.exercise.phases.length,
        cycles: this.cycles,
        color: this.exercise.color,
        remaining
      });

      if (this.elapsed >= totalMs) {
        clearInterval(this.timer);
        this.phaseIndex++;
        if (this.phaseIndex >= this.exercise.phases.length) {
          this.phaseIndex = 0;
          this.cycles++;
          if (this.onCycleComplete) this.onCycleComplete(this.cycles);
          if (this.cycles >= this.targetCycles) {
            this.stop();
            return;
          }
        }
        this._runPhase();
      }
    }, tick);
  }

  stop() {
    this.running = false;
    clearInterval(this.timer);
  }

  get isRunning() {
    return this.running;
  }
}
