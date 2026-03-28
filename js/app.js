// ===== APP CONTROLLER =====
const App = {
  currentView: 'home',
  breathingExercise: null,
  session: null,
  sessionBreathing: null,

  init() {
    this._setupNav();
    this._setupHome();
    this._setupBreathing();
    this._setupSounds();
    this._setupSession();
    this._updateProgress();
    this._registerSW();
  },

  // ===== NAVIGATION =====
  _setupNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.navigate(btn.dataset.view));
    });
  },

  navigate(view) {
    // Stop any running exercises when navigating away
    if (this.breathingExercise?.isRunning) this.breathingExercise.stop();

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const viewEl = document.getElementById(`view-${view}`);
    if (viewEl) {
      viewEl.classList.add('active');
      this.currentView = view;
    }

    const navBtn = document.querySelector(`.nav-btn[data-view="${view}"]`);
    if (navBtn) navBtn.classList.add('active');

    if (view === 'progress') this._updateProgress();
  },

  showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId)?.classList.add('active');
    // Hide nav for session/breathe-active/complete views
    const hideNav = ['view-session', 'view-breathe-active', 'view-complete'].includes(viewId);
    document.getElementById('nav').style.display = hideNav ? 'none' : '';
  },

  // ===== HOME =====
  _setupHome() {
    document.getElementById('btn-start-session').addEventListener('click', () => this._startSession());

    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'quick-breathe') {
          this._startBreathing(btn.dataset.exercise);
        } else if (action === 'quick-sound') {
          this.navigate('sounds');
          setTimeout(() => this._playSound(btn.dataset.preset), 100);
        }
      });
    });
  },

  // ===== BREATHING =====
  _setupBreathing() {
    const list = document.getElementById('breathing-list');
    const exercises = BreathingExercise.EXERCISES;

    for (const [key, ex] of Object.entries(exercises)) {
      const card = document.createElement('div');
      card.className = 'card-item';
      card.innerHTML = `
        <div class="card-icon" style="color:${ex.color}">●</div>
        <div class="card-info">
          <h4>${ex.name}</h4>
          <p>${ex.description}</p>
        </div>
      `;
      card.addEventListener('click', () => this._startBreathing(key));
      list.appendChild(card);
    }

    document.getElementById('btn-breathe-back').addEventListener('click', () => this._stopBreathing());
    document.getElementById('btn-breathe-stop').addEventListener('click', () => this._stopBreathing());
  },

  _startBreathing(exerciseKey) {
    const exercise = BreathingExercise.EXERCISES[exerciseKey];
    if (!exercise) return;

    document.getElementById('breathe-active-name').textContent = exercise.name;
    this.showView('view-breathe-active');

    const ring = document.getElementById('breath-ring');
    const actionEl = document.getElementById('breath-action');
    const countEl = document.getElementById('breath-count');
    const cyclesEl = document.getElementById('breath-cycles');
    this._breathStartTime = Date.now();

    this.breathingExercise = new BreathingExercise(
      (state) => {
        actionEl.textContent = state.action;
        countEl.textContent = state.remaining ?? '';
        ring.style.borderColor = state.color;

        ring.classList.remove('inhale', 'exhale', 'hold');
        const a = state.action.toLowerCase();
        if (a.includes('in')) ring.classList.add('inhale');
        else if (a.includes('out') || a.includes('exhale')) ring.classList.add('exhale');
        else if (a.includes('hold')) ring.classList.add('hold');
      },
      (cycles) => {
        cyclesEl.textContent = `Cycles: ${cycles}`;
      }
    );

    this.breathingExercise.start(exerciseKey);
  },

  _stopBreathing() {
    if (this.breathingExercise) {
      this.breathingExercise.stop();
      const duration = Math.round((Date.now() - (this._breathStartTime || Date.now())) / 1000);
      if (duration > 10) Storage.logSession('breathing', duration);
    }
    this.showView('view-breathe');
    document.getElementById('nav').style.display = '';
    document.querySelector('.nav-btn[data-view="breathe"]').classList.add('active');
  },

  // ===== SOUNDS =====
  _setupSounds() {
    const list = document.getElementById('sound-list');
    const presets = BinauralEngine.PRESETS;

    for (const [key, preset] of Object.entries(presets)) {
      const card = document.createElement('div');
      card.className = 'card-item';
      card.id = `sound-card-${key}`;
      card.innerHTML = `
        <div class="card-icon">${preset.icon}</div>
        <div class="card-info">
          <h4>${preset.name}</h4>
          <p>${preset.description}</p>
        </div>
      `;
      card.addEventListener('click', () => this._playSound(key));
      list.appendChild(card);
    }

    document.getElementById('volume-slider').addEventListener('input', (e) => {
      binauralEngine.setVolume(e.target.value / 100);
    });

    document.getElementById('btn-sound-stop').addEventListener('click', () => this._stopSound());
    this._soundStartTime = null;
  },

  _playSound(presetKey) {
    const preset = BinauralEngine.PRESETS[presetKey];
    if (!preset) return;

    binauralEngine.play(presetKey, document.getElementById('volume-slider').value / 100);
    this._soundStartTime = Date.now();

    document.getElementById('sound-player-name').textContent = preset.name;
    document.getElementById('sound-player').classList.remove('hidden');

    document.querySelectorAll('#sound-list .card-item').forEach(c => c.classList.remove('active-card'));
    document.getElementById(`sound-card-${presetKey}`)?.classList.add('active-card');
  },

  _stopSound() {
    _silentAudio.pause();
    binauralEngine.stop();
    if (this._soundStartTime) {
      const duration = Math.round((Date.now() - this._soundStartTime) / 1000);
      if (duration > 10) Storage.logSession('binaural', duration);
      this._soundStartTime = null;
    }
    document.getElementById('sound-player').classList.add('hidden');
    document.querySelectorAll('#sound-list .card-item').forEach(c => c.classList.remove('active-card'));
  },

  // ===== 15-MIN SESSION =====
  _setupSession() {
    document.getElementById('btn-session-pause').addEventListener('click', () => this._togglePauseSession());
    document.getElementById('btn-session-stop').addEventListener('click', () => this._endSession());
    document.getElementById('btn-complete-home').addEventListener('click', () => {
      this.showView('view-home');
      document.getElementById('nav').style.display = '';
      document.querySelector('.nav-btn[data-view="home"]').classList.add('active');
    });
  },

  _startSession() {
    this.showView('view-session');

    // Build phase dots
    const indicator = document.getElementById('session-phase-indicator');
    indicator.innerHTML = StressResetSession.PHASES.map((_, i) =>
      `<div class="phase-dot" id="phase-dot-${i}"></div>`
    ).join('');

    this.session = new StressResetSession(
      // onUpdate
      (state) => {
        // Timer
        const rem = Math.max(0, state.globalRemaining);
        const min = Math.floor(rem / 60);
        const sec = Math.floor(rem % 60);
        document.getElementById('session-timer').textContent =
          `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

        // Progress bar
        document.getElementById('session-global-bar').style.width =
          `${state.globalProgress * 100}%`;
      },
      // onPhaseChange
      (phase, index, total) => {
        document.getElementById('session-phase-name').textContent = phase.name;
        document.getElementById('session-description').textContent = phase.description;

        // Update dots
        for (let i = 0; i < total; i++) {
          const dot = document.getElementById(`phase-dot-${i}`);
          dot.classList.remove('done', 'current');
          if (i < index) dot.classList.add('done');
          if (i === index) dot.classList.add('current');
        }

        // Audio
        if (phase.audio) {
          binauralEngine.play(phase.audio, 0.4);
        }

        // Breathing
        if (this.sessionBreathing) {
          this.sessionBreathing.stop();
          this.sessionBreathing = null;
        }

        const breathVisual = document.getElementById('session-breath-visual');
        if (phase.breathing) {
          breathVisual.classList.remove('hidden');
          const ring = document.getElementById('session-breath-ring');
          const actionEl = document.getElementById('session-breath-action');
          const countEl = document.getElementById('session-breath-count');

          this.sessionBreathing = new BreathingExercise(
            (state) => {
              actionEl.textContent = state.action;
              countEl.textContent = state.remaining ?? '';
              ring.classList.remove('inhale', 'exhale', 'hold');
              const a = state.action.toLowerCase();
              if (a.includes('in')) ring.classList.add('inhale');
              else if (a.includes('out') || a.includes('exhale')) ring.classList.add('exhale');
              else if (a.includes('hold')) ring.classList.add('hold');
            },
            null
          );
          this.sessionBreathing.start(phase.breathing);
        } else {
          breathVisual.classList.add('hidden');
        }
      },
      // onComplete
      (totalSec) => {
        this._sessionComplete(totalSec);
      }
    );

    this.session.start();
  },

  _togglePauseSession() {
    if (!this.session) return;
    const paused = this.session.togglePause();
    document.getElementById('btn-session-pause').textContent = paused ? 'Resume' : 'Pause';
    if (this.sessionBreathing) {
      paused ? this.sessionBreathing.stop() : null;
    }
  },

  _endSession() {
    if (this.session) {
      const elapsed = this.session.globalElapsed || 0;
      this.session.stop();
      if (this.sessionBreathing) this.sessionBreathing.stop();
      binauralEngine.stop();
      if (elapsed > 30) {
        this._sessionComplete(elapsed);
      } else {
        this.showView('view-home');
        document.getElementById('nav').style.display = '';
        document.querySelector('.nav-btn[data-view="home"]').classList.add('active');
      }
    }
  },

  _sessionComplete(totalSec) {
    _silentAudio.pause();
    binauralEngine.stop();
    if (this.sessionBreathing) this.sessionBreathing.stop();

    const data = Storage.logSession('full-reset', totalSec);
    const stats = Storage.getStats();

    document.getElementById('complete-duration').textContent = Math.round(totalSec / 60);
    document.getElementById('complete-streak').textContent = stats.streak;
    this.showView('view-complete');
  },

  // ===== PROGRESS =====
  _updateProgress() {
    const stats = Storage.getStats();
    document.getElementById('stat-streak').textContent = stats.streak;
    document.getElementById('stat-today').textContent = stats.todayMinutes;
    document.getElementById('stat-total-sessions').textContent = stats.totalSessions;
    document.getElementById('stat-total-minutes').textContent = stats.totalMinutes;

    // Weekly chart
    const chart = document.getElementById('weekly-chart');
    const maxCount = Math.max(1, ...stats.last7Days.map(d => d.count));
    chart.innerHTML = stats.last7Days.map(d => {
      const height = d.count > 0 ? Math.max(10, (d.count / maxCount) * 90) : 4;
      return `
        <div class="chart-bar-wrapper">
          <div class="chart-count">${d.count || ''}</div>
          <div class="chart-bar ${d.count === 0 ? 'empty' : ''}" style="height:${height}%"></div>
          <div class="chart-label">${d.label}</div>
        </div>
      `;
    }).join('');
  },

  // ===== SERVICE WORKER =====
  _registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
