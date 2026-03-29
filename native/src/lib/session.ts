export interface SessionPhase {
  name: string;
  duration: number;
  description: string;
  audio: string | null;
  breathing: string | null;
}

export const PHASES: SessionPhase[] = [
  { name: 'Settle In', duration: 60, description: "Close your eyes. Let your shoulders drop. You're safe here.", audio: 'deepRelax', breathing: null },
  { name: 'Physiological Sighs', duration: 120, description: 'Double inhale through the nose, long exhale through the mouth. The fastest way to calm your nervous system.', audio: 'stressRelief', breathing: 'physiologicalSigh' },
  { name: 'Deep Breathing', duration: 180, description: 'Slow 4-7-8 breathing. Each cycle activates your parasympathetic nervous system.', audio: 'stressRelief', breathing: 'fourSevenEight' },
  { name: 'Theta Entrainment', duration: 180, description: 'Let the binaural beats guide your brain into theta state. Simply listen and breathe naturally.', audio: 'deepRelax', breathing: null },
  { name: 'Box Breathing', duration: 180, description: 'Equal box breathing for balance and control. In-hold-out-hold, each for 4 counts.', audio: 'calmFocus', breathing: 'box' },
  { name: 'Alpha Restoration', duration: 120, description: "Alpha waves restore calm alertness. You're becoming centered and clear.", audio: 'calmFocus', breathing: 'extendedExhale' },
  { name: 'Integration', duration: 60, description: "Notice how you feel. The calm you've built is yours to carry forward.", audio: 'calmFocus', breathing: null },
];

export const TOTAL_DURATION = PHASES.reduce((a, p) => a + p.duration, 0);

export interface SessionState {
  phase: SessionPhase;
  phaseIndex: number;
  totalPhases: number;
  phaseProgress: number;
  globalProgress: number;
  globalRemaining: number;
  phaseRemaining: number;
}

export class SessionEngine {
  private running = false;
  private paused = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private phaseIndex = 0;
  private phaseElapsed = 0;
  globalElapsed = 0;

  private onUpdate: (state: SessionState) => void;
  private onPhaseChange: (phase: SessionPhase, index: number, total: number) => void;
  private onComplete: (totalSec: number) => void;

  constructor(
    onUpdate: (state: SessionState) => void,
    onPhaseChange: (phase: SessionPhase, index: number, total: number) => void,
    onComplete: (totalSec: number) => void
  ) {
    this.onUpdate = onUpdate;
    this.onPhaseChange = onPhaseChange;
    this.onComplete = onComplete;
  }

  start() {
    this.running = true;
    this.paused = false;
    this.phaseIndex = 0;
    this.phaseElapsed = 0;
    this.globalElapsed = 0;
    this.startPhase();
  }

  private startPhase() {
    if (!this.running || this.phaseIndex >= PHASES.length) {
      this.complete();
      return;
    }

    const phase = PHASES[this.phaseIndex];
    this.phaseElapsed = 0;
    this.onPhaseChange(phase, this.phaseIndex, PHASES.length);
    this.tick();
  }

  private tick() {
    if (!this.running) return;
    const phase = PHASES[this.phaseIndex];
    const tickMs = 200;

    this.timer = setInterval(() => {
      if (this.paused) return;
      this.phaseElapsed += tickMs / 1000;
      this.globalElapsed += tickMs / 1000;

      this.onUpdate({
        phase,
        phaseIndex: this.phaseIndex,
        totalPhases: PHASES.length,
        phaseProgress: this.phaseElapsed / phase.duration,
        globalProgress: this.globalElapsed / TOTAL_DURATION,
        globalRemaining: TOTAL_DURATION - this.globalElapsed,
        phaseRemaining: phase.duration - this.phaseElapsed,
      });

      if (this.phaseElapsed >= phase.duration) {
        if (this.timer) clearInterval(this.timer);
        this.phaseIndex++;
        this.startPhase();
      }
    }, tickMs);
  }

  togglePause(): boolean {
    this.paused = !this.paused;
    return this.paused;
  }

  stop() {
    this.running = false;
    this.paused = false;
    if (this.timer) clearInterval(this.timer);
  }

  private complete() {
    this.running = false;
    if (this.timer) clearInterval(this.timer);
    this.onComplete(this.globalElapsed);
  }

  get isRunning() { return this.running; }
  get isPaused() { return this.paused; }
}
