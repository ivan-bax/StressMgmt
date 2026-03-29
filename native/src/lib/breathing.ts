export interface BreathPhase {
  action: string;
  duration: number;
}

export interface BreathExercise {
  name: string;
  description: string;
  phases: BreathPhase[];
  color: string;
}

export const EXERCISES: Record<string, BreathExercise> = {
  box: {
    name: 'Box Breathing',
    description: 'Equal phases of inhale, hold, exhale, hold. Used by Navy SEALs for instant calm.',
    phases: [
      { action: 'Breathe In', duration: 4 },
      { action: 'Hold', duration: 4 },
      { action: 'Breathe Out', duration: 4 },
      { action: 'Hold', duration: 4 },
    ],
    color: '#4fc3f7',
  },
  fourSevenEight: {
    name: '4-7-8 Breathing',
    description: "Dr. Andrew Weil's technique. Activates the parasympathetic nervous system.",
    phases: [
      { action: 'Breathe In', duration: 4 },
      { action: 'Hold', duration: 7 },
      { action: 'Breathe Out', duration: 8 },
    ],
    color: '#81c784',
  },
  extendedExhale: {
    name: 'Extended Exhale',
    description: 'Longer exhale than inhale. Stimulates the vagus nerve for rapid calming.',
    phases: [
      { action: 'Breathe In', duration: 4 },
      { action: 'Breathe Out', duration: 8 },
    ],
    color: '#ce93d8',
  },
  physiologicalSigh: {
    name: 'Physiological Sigh',
    description: "Double inhale + long exhale. Huberman Lab's top recommendation for real-time stress relief.",
    phases: [
      { action: 'Inhale', duration: 2 },
      { action: 'Inhale More', duration: 2 },
      { action: 'Long Exhale', duration: 6 },
    ],
    color: '#ffb74d',
  },
};

export interface BreathState {
  action: string;
  duration: number;
  progress: number;
  phaseIndex: number;
  totalPhases: number;
  cycles: number;
  color: string;
  remaining?: number;
}

export class BreathingEngine {
  private running = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private exerciseKey: string | null = null;
  private phaseIndex = 0;
  private elapsed = 0;
  private cycles = 0;
  private targetCycles = Infinity;
  private onUpdate: (state: BreathState) => void;
  private onCycleComplete: ((cycles: number) => void) | null;

  constructor(
    onUpdate: (state: BreathState) => void,
    onCycleComplete: ((cycles: number) => void) | null = null
  ) {
    this.onUpdate = onUpdate;
    this.onCycleComplete = onCycleComplete;
  }

  start(exerciseKey: string, totalCycles = Infinity) {
    const exercise = EXERCISES[exerciseKey];
    if (!exercise) return;
    this.exerciseKey = exerciseKey;
    this.running = true;
    this.cycles = 0;
    this.targetCycles = totalCycles;
    this.phaseIndex = 0;
    this.elapsed = 0;
    this.runPhase();
  }

  private runPhase() {
    if (!this.running || !this.exerciseKey) return;
    const exercise = EXERCISES[this.exerciseKey];
    const phase = exercise.phases[this.phaseIndex];
    const totalMs = phase.duration * 1000;
    this.elapsed = 0;

    this.onUpdate({
      action: phase.action,
      duration: phase.duration,
      progress: 0,
      phaseIndex: this.phaseIndex,
      totalPhases: exercise.phases.length,
      cycles: this.cycles,
      color: exercise.color,
    });

    const tick = 50;
    this.timer = setInterval(() => {
      this.elapsed += tick;
      const progress = Math.min(this.elapsed / totalMs, 1);
      const remaining = Math.ceil((totalMs - this.elapsed) / 1000);

      this.onUpdate({
        action: phase.action,
        duration: phase.duration,
        progress,
        phaseIndex: this.phaseIndex,
        totalPhases: exercise.phases.length,
        cycles: this.cycles,
        color: exercise.color,
        remaining,
      });

      if (this.elapsed >= totalMs) {
        if (this.timer) clearInterval(this.timer);
        this.phaseIndex++;
        if (this.phaseIndex >= exercise.phases.length) {
          this.phaseIndex = 0;
          this.cycles++;
          this.onCycleComplete?.(this.cycles);
          if (this.cycles >= this.targetCycles) {
            this.stop();
            return;
          }
        }
        this.runPhase();
      }
    }, tick);
  }

  stop() {
    this.running = false;
    if (this.timer) clearInterval(this.timer);
  }

  get isRunning() {
    return this.running;
  }
}
